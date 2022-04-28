/* eslint-disable no-console */
require('dotenv').config();
const { Pool } = require('pg');

const connection = {
  database: process.env.PRODUCTION_DB_NAME,
  // Add authentication here probably
  user: process.env.PRODUCTION_DB_USER,
  password: process.env.PRODUCTION_DB_PW,
  host: process.env.PRODUCTION_DB_HOST,
};
const pool = new Pool(connection);

// Test query:
pool.query('SELECT * FROM product WHERE id=10')
  .then(() => {
    console.log('[PRODUCT DB]: Connected to DB');
  })
  .catch((err) => {
    console.log('[PRODUCT DB]:', err);
  });

module.exports.query = (text, params) => pool.query(text, params);
