/* eslint-disable no-console */
require('dotenv').config();
require('../index'); // Configuration
const express = require('express');
const models = require('../models');

const app = express();
const PORT = process.env.SERVICE_PORT;
let beep = 0;

const boop = (text = '') => {
  beep = beep === 1000 ? 0 : beep + 1;
  if (beep === 1000) { console.log('boop', text); }
};

app.use(express.static('static'));

// Individual style getter:
app.get('/products/style/:styleId', (req, res) => {
  models.product.getStyleById(req.params.styleId)
    .then((style) => {
      res.send(JSON.stringify(style));
    });
});

// Get all styles of a product:
app.get('/products/:productId/styles', (req, res) => {
  boop('style');
  models.product.getStylesByProductId(req.params.productId)
    .then((styles) => {
      res.send(JSON.stringify(styles));
    });
});

// Get all related items of a product:
app.get('/products/:productId/related', (req, res) => {
  models.product.getRelatedByProductId(req.params.productId)
    .then((items) => {
      res.send(JSON.stringify(items));
    });
});

// Get the entire product object:
app.get('/products/:productId', (req, res) => {
  boop('product');
  models.product.getProductById(req.params.productId)
    .then((product) => {
      res.send(JSON.stringify(product));
    });
});

app.get('/products', (req, res) => {
  boop();
  const { count, page } = req.query;
  models.product.getProducts(page, count)
    .then((products) => {
      res.send(JSON.stringify(products));
    });
});

app.use('/', (req, res) => {
  console.log('[PRODUCT]: Incoming request from routing server:', req.url);
  res.send('Pizza Product API');
});

app.listen(PORT);
console.log('[PRODUCT]: Product API server listening on:', PORT);
