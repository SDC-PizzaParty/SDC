/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const axios = require('axios');

// Start the API servers: You can comment out the ones which you are not using:
require('./api/productApi');
require('./api/qaApi');
require('./api/reviewApi');

// Server URL
const URL = 'http://127.0.0.1';
const PRODUCT_URL = `${URL}:${process.env.PRODUCT_PORT}`;
const QA_URL = `${URL}:${process.env.QA_PORT}`;
const REVIEWS_URL = `${URL}:${process.env.REVIEWS_PORT}`;

const app = express();

// Services routing: forwards request body to service, forwards response to client:

app.use('/products', (req, res) => {
  const url = PRODUCT_URL + req.originalUrl;
  console.log('[Router]: Routing to:', url);
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

app.use('/qa', (req, res) => {
  const url = QA_URL + req.originalUrl;
  console.log('[Router]: Routing to:', url);
  axios(url, {
    method: req.method,
    data: req.body,
  })
    .then((apiRes) => {
      console.log('[Router]: Sending data from QA API:', apiRes.data);
      res.send(apiRes.data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use('/reviews', (req, res) => {
  const url = REVIEWS_URL + req.originalUrl;
  console.log('[Router]: Routing to:', url);
  axios(url, {
    method: req.method,
    data: req.body,
  })
    .then((apiRes) => {
      console.log('[Router]: Sending data from Reviews API:', apiRes.data);
      res.send(apiRes.data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(process.env.PORT);
console.log('[Router]: Server listening on:', process.env.PORT);
