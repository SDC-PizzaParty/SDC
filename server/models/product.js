/* eslint-disable no-console */
const db = require('../../database/product/db');

const getFeaturesByProductId = (productId) => {
  const query = {
    name: 'fetch-features',
    text: 'SELECT feature, value FROM features WHERE product_id = $1',
    values: [productId],
  };
  return db.query(query);
};

const getPhotosByStyleId = (styleId) => {
  const query = {
    name: 'fetch-photos',
    text: 'SELECT * from photos WHERE style_id = $1',
    values: [styleId],
  };
  return db.query(query);
};

const getSkusByStyleId = (styleId) => {
  const query = {
    name: 'fetch-skus',
    text: 'SELECT * from skus WHERE style_id = $1',
    values: [styleId],
  };
  // results.rows -> [{ id: 25, style_id: 5, size: 'XS', quantity: 8 }, ...]
  // want to transform to -> {25: {quantity: 8, size: 'XS'}, ...}
  const skus = {};
  return db.query(query)
    .then((results) => {
      results.rows.forEach((e) => {
        skus[e.id] = {
          quantity: e.quantity,
          size: e.size,
        };
      });
      return { skus };
    })
    .catch((err) => {
      console.log('[PRODUCT MODEL]:', err);
    });
};

const getStyleById = (styleId) => {
  const query = {
    name: 'fetch-style',
    text: 'SELECT * from styles WHERE id = $1',
    values: [styleId],
  };

  return Promise.all([
    db.query(query),
    getSkusByStyleId(styleId),
  ])
    .then((results) => {
      const style = { ...results[0].rows[0], ...results[1] };
      console.log('Got style:', style);
      return style;
    })
    .catch((err) => {
      console.log('[PRODUCT MODEL]:', err);
    });
};

const getStylesByProductId = (productId) => {
  // For slow version: Need to build the style object here
  // using additional queries to photos and skus
  const styles = {};
  styles.product_id = productId;

  const query = {
    name: 'fetch-style-ids',
    text: 'SELECT id FROM styles WHERE product_id = $1',
    values: [productId],
  };

  return db.query(query)
    .then((results) => {
      // results are style ids

    })
    .catch((err) => {
      console.log('[PRODUCT MODEL]:', err);
    });
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
    getStylesByProductId(productId),
  ])
    .then((results) => {
      const product = results[0].rows[0];
      product.features = results[1].rows;
      console.log('[PRODUCT MODEL]: Product:', product);
      return product;
    })
    .catch((err) => {
      console.log('[PRODUCT MODEL]:', err);
      return err;
    });
};

module.exports.getStyleById = getStyleById;

module.exports.getStylesByProductId = getStylesByProductId;

module.exports.getProductById = getProductById;

module.exports.benchmark = (queryString, params) => {
  const query = `EXPLAIN ANALYZE ${queryString}`;
  // Expected result.rows[0]:
  // {'QUERY PLAN': 'Gather. . . (actual time=0.359..67.363 rows=6 loops=1)'}
  return db.query(query, params)
    .then((result) => result.rows[0]);
};
