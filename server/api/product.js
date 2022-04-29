/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const models = require('../models');

const app = express();
const PORT = process.env.PRODUCT_PORT;

// Individual style getter:
app.get('/products/style/:styleId', (req, res) => {
  // console.log('\n[PRODUCT] Request for style:', req.params.styleId);
  models.product.getStyleById(req.params.styleId)
    .then((style) => {
      res.send(JSON.stringify(style));
    });
});

// Get all styles of a product:
app.get('/products/:productId/styles', (req, res) => {
  // console.log('\n[PRODUCT] Request for styles from product:', req.params.productId);
  models.product.getStylesByProductId(req.params.productId)
    .then((styles) => {
      res.send(JSON.stringify(styles));
    });
});

// Get all related items of a product:
app.get('/products/:productId/related', (req, res) => {
  // console.log('\n[PRODUCT] Request for related items for product:', req.params.productId);
  models.product.getRelatedByProductId(req.params.productId)
    .then((items) => {
      res.send(JSON.stringify(items));
    });
});

// Get the entire product object:
app.get('/products/:productId', (req, res) => {
  // console.log('\n[PRODUCT] Request for product:', req.params.productId);
  models.product.getProductById(req.params.productId)
    .then((product) => {
      res.send(JSON.stringify(product));
    });
});

app.use('/products', (req, res) => {
  const { count, page } = req.query;
  // console.log('[PRODUCT]: Request for products:', count, page);
  models.product.getProducts(page, count)
    .then((products) => {
      res.send(JSON.stringify(products));
    });
});

app.use('/', (req, res) => {
  console.log('[PRODUCT]: Incoming request from routing server:', req.url);
  res.send('Response from Product API');
});

app.listen(PORT);
console.log('[PRODUCT]: Product API server listening on:', PORT);
