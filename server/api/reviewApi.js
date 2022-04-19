/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');

const app = express();

app.listen(process.env.REVIEW_PORT);
console.log('Review API server listening on:', process.env.REVIEW_PORT);
