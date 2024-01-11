const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/noticias', async (req, res) => {
  try {
    // Inicializar Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Ir a la página de Xataka
    console.log('Navigating to Xataka...');
    await page.goto('https://www.xataka.com/', { waitUntil: 'domcontentloaded' });

    // Obtener enlaces a todos los artículos en la página principal directamente desde la estructura HTML
    const articleLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.abstract-title a'));
      return links.map(link => link.href);
    });

    // Cerrar el navegador, ya que ya hemos recopilado los enlaces
    await browser.close();

    console.log('Article links:', articleLinks);

    if (!articleLinks.length) {
      return res.status(404).json({ error: 'No se encontraron enlaces de artículos' });
    }

    // Obtener datos de cada artículo utilizando article-extractor
    console.log('Fetching article data...');
    const articlesData = await Promise.allSettled(articleLinks.map(async link => {
      try {
        const { extract } = await import('@extractus/article-extractor');
        const article = await extract(link);
        return article;
      } catch (error) {
        console.error(`Error al extraer datos de ${link}:`, error.message);
        throw error;
      }
    }));

    // Filtrar artículos nulos (donde hubo un error en la extracción)
    const validArticlesData = articlesData
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);

    console.log('Valid articles data:', validArticlesData);

    // Enviar los datos de los artículos al frontend
    res.json(validArticlesData);
  } catch (error) {
    console.error('Error en la ruta /noticias:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

const port = 3001;

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
