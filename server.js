const express = require('express');
const puppeteer = require('puppeteer');
const Parser = require('rss-parser');
const cors = require('cors');

const app = express();

app.use(cors());

// Inicializar el parser de RSS
const parser = new Parser();

app.get('/noticias', async (req, res) => {
  try {
    const rssFeedUrl = 'https://www.gadgets360.com/rss/apps/feeds'; // URL del feed RSS de Wired

    // Obtener noticias del feed RSS
    const feed = await parser.parseURL(rssFeedUrl);
    const news = feed.items;

    // Enviar las noticias al frontend
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

const port = 3001;

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
