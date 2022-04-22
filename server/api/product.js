/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const models = require('../models');

const app = express();

app.get('/test/:productId', (req, res) => {
  models.product.getProductById(req.params.productId)
    .then(() => {
      res.send();
    });
});

app.use('/', (req, res) => {
  console.log('[PRODUCT]: Incoming request from routing server:', req.url);
  res.send('Response from Product API');
});

app.listen(process.env.PRODUCT_PORT);
console.log('[PRODUCT]: Product API server listening on:', process.env.PRODUCT_PORT);

// For middleware app (not our use case now):
// module.exports = (req, res) => {
//   // This request is coming from the routing file
//   console.log('incoming request to PRODUCT API', req.url, req.method, req.port);
//   res.send('response from PRODUCT API MIDDLEWARE');
// };
