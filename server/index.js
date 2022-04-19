/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const axios = require('axios');

// Start the API servers:
require('./api/productApi');
require('./api/qaApi');
require('./api/reviewApi');

// Server URL
const URL = 'http://127.0.0.1';
const PRODUCT_URL = `${URL}:${process.env.PRODUCT_PORT}`;

const app = express();

app.use('/products', (req, res) => {
  const url = PRODUCT_URL + req.originalUrl;
  console.log(url);
  axios(url, {
    method: req.method,
    data: req.body,
  })
    .then((apiRes) => {
      console.log('[Router]: Sending data from Product API:', apiRes.data);
      res.send(apiRes.data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(process.env.PORT);
console.log('[Router]: Server listening on:', process.env.PORT);
