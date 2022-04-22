/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const models = require('../models');

const app = express();

app.get('/test', (req, res) => {
  const testQ = 'SELECT * FROM styles JOIN product ON product_id = product.id AND product.id = 10';
  models.product.benchmark(testQ)
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
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
