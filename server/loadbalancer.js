/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const API_URLS = [];

(() => {
  let num = 1;
  while (process.env[`PRODUCT_API_${num}`]) {
    API_URLS.push(process.env[`PRODUCT_API_${num}`]);
    num += 1;
  }
})();

console.log('[Load Balancer] Routes:', API_URLS);

let currentServer = 0;

app.use(express.static('loader'));

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
      console.log(err);
    });
  // Switch the server:
  currentServer = currentServer === (API_URLS.length - 1) ? 0 : currentServer + 1;
});

app.listen(process.env.LB_PORT);
console.log('[Load balancer] Listening on:', process.env.LB_PORT);
