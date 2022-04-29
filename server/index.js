/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const axios = require('axios');

// In order to add more instances of the service add them to this list:
const PRODUCT_URLS = require('./loadbalancer');

console.log(PRODUCT_URLS);

let currentServer = 0;

const app = express();

app.use(express.static('loader'));

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

app.listen(process.env.LB_PORT);
console.log('[Router]: Server listening on:', process.env.LB_PORT);
