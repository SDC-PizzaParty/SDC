/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');

const app = express();

app.use('/', (req, res) => {
  console.log('[QA]: Incoming request from routing server:', req.url);
  res.send('Response from QA API');
});

app.listen(process.env.QA_PORT);
console.log('[QA]: QA API server listening on:', process.env.QA_PORT);
