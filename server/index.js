/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');

const app = express();

app.listen(process.env.PORT);
console.log('Server listening on:', process.env.PORT);
