/* eslint-disable no-console */
require('dotenv').config();
require('./index'); // Configuration
const express = require('express');
const axios = require('axios');

const app = express();
const API_URLS = [];

(() => {
  let num = 1;
  while (process.env[`SERVICE_${num}`]) {
    API_URLS.push(process.env[`SERVICE_${num}`]);
    num += 1;
  }
})();

console.log('[LOAD BALANCER] Routes:', API_URLS);

let currentServer = 0;

app.use(express.static('static'));

app.use('/products', (req, res) => {
  const url = API_URLS[currentServer] + req.originalUrl;
  // console.log('[Load balancer] Routing to:', url, `[${currentServer}]`);
  axios(url, {
    method: req.method,
    data: req.body,
  })
    .then(({ data }) => {
      res.send(data);
    })
    .catch((err) => {
      console.log('[LOAD BALANCER] Error from:', url, err);
    });
  // Switch the server:
  currentServer = currentServer === (API_URLS.length - 1) ? 0 : currentServer + 1;
});

app.get('/', (req, res) => {
  console.log('[LOAD BALANCER] Incoming request from:', req.ip);
  res.send('Pizza Product API LB');
});

app.listen(process.env.LB_PORT);
console.log('[LOAD BALANCER] Listening on:', process.env.LB_PORT);
