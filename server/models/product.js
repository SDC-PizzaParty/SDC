/* eslint-disable no-console */
const db = require('../../database/product/db');

const getFeaturesByProductId = (productId) => {
  const query = {
    name: 'fetch-features',
    text: 'SELECT * FROM features WHERE product_id = $1',
    values: [productId],
  };
  return db.query(query);
};

const getStylesByProductId = (productId) => {
  const query = {
    name: 'fetch-styles',
    text: 'SELECT * FROM styles WHERE product_id = $1',
    values: [productId],
  };
  return db.query(query);
};

const getProductById = (productId) => {
  const query = {
    name: 'fetch-product',
    text: 'SELECT * FROM product WHERE id = $1',
    values: [productId],
  };
  return Promise.all([
    db.query(query),
    getFeaturesByProductId(productId),
  ])
    .then((results) => {
      console.log('[PRODUCT MODEL]:', results[0].rows[0]);
      console.log('[PRODUCT MODEL]:', results[1].rows);
    })
    .catch((err) => {
      console.log('[PRODUCT MODEL]:', err);
    });
};

module.exports.getProductById = getProductById;

module.exports.benchmark = (queryString, params) => {
  const query = `EXPLAIN ANALYZE ${queryString}`;
  // Expected result.rows[0]:
  // {'QUERY PLAN': 'Gather. . . (actual time=0.359..67.363 rows=6 loops=1)'}
  return db.query(query, params)
    .then((result) => result.rows[0]);
};
