const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/producto', async (req, res) => {
  try {
    const url = req.query.url; 

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const stateObject = await page.$eval('span#cr-state-object', (element) => element.getAttribute('data-state'));
    const stateData = JSON.parse(stateObject);

    const rating = stateData['averageStarRating'];
    const reviewCount = stateData['totalReviewCount'];

    await browser.close();

    res.json({ rating, reviewCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

const port = 3001;

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});