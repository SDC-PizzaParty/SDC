/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const axios = require('axios');

// Start the API servers: You can comment out the ones which you are not using:
require('./api/product');
require('./api/product1');

// Server URL:
const URL = 'http://127.0.0.1';
// In order to add more instances of the service add them to this list:
const PRODUCT_URLS = [
  `${URL}:${process.env.PRODUCT_PORT}`,
  `${URL}:${process.env.PRODUCT_PORT_1}`,
];
let currentServer = 0;

const app = express();

// Services routing: forwards request body to service, forwards response to client:

app.use('/products', (req, res) => {
  const url = PRODUCT_URLS[currentServer] + req.originalUrl;
  console.log('[Router]: Routing to:', url);
  axios(url, {
    method: req.method,
    data: req.body,
  })
    .then((apiRes) => {
      // console.log('[Router]: Sending data from Product API:', apiRes.data);
      res.send(apiRes.data);
    })
    .catch((err) => {
      console.log(err);
    });
  // Switch the server:
  currentServer = currentServer === (PRODUCT_URLS.length - 1) ? 0 : currentServer + 1;
  console.log(currentServer);
});

app.listen(process.env.PORT);
console.log('[Router]: Server listening on:', process.env.PORT);
