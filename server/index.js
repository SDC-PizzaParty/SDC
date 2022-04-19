/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const productsAPI = require('./routes/products');
const qaAPI = require('./routes/qa');
const reviewsAPI = require('./routes/reviews');

const app = express();

app.use('/products', productsAPI);
app.use('/qa', qaAPI);
app.use('/reviews', reviewsAPI);

app.listen(process.env.PORT);
console.log('Server listening on:', process.env.PORT);
