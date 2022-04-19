/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');

const app = express();

app.use('/', (req, res) => {
  console.log('[QUESTION]: Incoming request from routing server:', req.url);
  res.send('Response from QUESTION API');
});

app.listen(process.env.QA_PORT);
console.log('Question API server listening on:', process.env.QA_PORT);
