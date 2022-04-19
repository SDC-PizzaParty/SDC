/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');

const app = express();

app.use('/', (req, res) => {
  console.log('[REVIEWS]: Incoming request from routing server:', req.url);
  res.send('Response from Reviews API');
});

app.listen(process.env.REVIEWS_PORT);
console.log('[REVIEWS]: Reviews API server listening on:', process.env.REVIEWS_PORT);
