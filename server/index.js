/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const API_URLS = require('./loadbalancer');

console.log('[Load Balancer] Routes:', API_URLS);

let currentServer = 0;

const app = express();

app.use(express.static('loader'));

// Services routing: forwards request body to service, forwards response to client:
app.use('/products', (req, res) => {
  const url = API_URLS[currentServer] + req.originalUrl;
  console.log('[Load balancer] Routing to:', url, `[${currentServer}]`);
  axios(url, {
    method: req.method,
    data: req.body,
  })
    .then(({ data }) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
  // Switch the server:
  currentServer = currentServer === (API_URLS.length - 1) ? 0 : currentServer + 1;
});

app.listen(process.env.LB_PORT);
console.log('[Load balancer] Listening on:', process.env.LB_PORT);
