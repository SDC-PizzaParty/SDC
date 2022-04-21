/* eslint-disable no-console */
require('dotenv').config();
const { Pool } = require('pg');

const connection = {
  database: process.env.PRODUCT_DB,
  // Add authentication here probably
  // user:
  // password:
  // host:
};
const pool = new Pool(connection);

pool.query('SELECT * FROM product WHERE id=10')
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports.query = (text, params) => pool.query(text, params);
