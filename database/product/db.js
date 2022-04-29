/* eslint-disable no-console */
require('dotenv').config();
const { Pool } = require('pg');

const connection = {
  database: process.env.PRODUCTION_DB_NAME,
  user: process.env.PRODUCTION_DB_USER,
  password: process.env.PRODUCTION_DB_PW,
  host: process.env.PRODUCTION_DB_HOST,
};
const pool = new Pool(connection);

pool.query('SELECT NOW()')
  .then(({ rows }) => {
    console.log('[PRODUCT DB]: Connected to DB:', rows[0]);
  })
  .catch((err) => {
    console.log('[PRODUCT DB]:', err);
  });

module.exports.query = (text, params) => pool.query(text, params);
