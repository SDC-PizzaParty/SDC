/* eslint-disable no-console */
const db = require('../../database/product/db');

const getRelatedByProductId = (productId) => {
  const query = {
    text: 'SELECT related_product_id from related WHERE product_id = $1',
    values: [productId],
    rowMode: 'array',
  };
  return db.query(query)
    .then((result) => result.rows.flat());
};

const getFeaturesByProductId = (productId) => {
  const query = {
    text: 'SELECT feature, value FROM features WHERE product_id = $1',
    values: [productId],
  };
  return db.query(query)
    .then((result) => result.rows);
};

// Obsoleted:
// const getPhotosByStyleId = (styleId) => {
//   const query = {
//     text: 'SELECT thumbnail_url, url from photos WHERE style_id = $1',
//     values: [styleId],
//   };
//   return db.query(query)
//     .then((result) => result.rows);
// };

const getSkusByStyleId = (styleId) => {
  const query = {
    text: 'SELECT * from skus WHERE style_id = $1',
    values: [styleId],
  };
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
    text: `
    SELECT id AS style_id, name, original_price, sale_price, default_style AS "default?",
      (SELECT json_agg(ph)
        FROM (SELECT url, thumbnail_url FROM photos WHERE style_id = s.id) as ph) AS photos
      FROM styles AS s WHERE id = $1`,
    values: [styleId],
  };
  return Promise.all([
    db.query(query),
    getSkusByStyleId(styleId),
  ])
    .then((results) => {
      const style = {
        ...results[0].rows[0],
        ...results[1],
        photos: results[2],
      };
      // console.log('[PRODUCT MODEL] Style:', style);
      return style;
    })
    .catch((err) => {
      console.log('[PRODUCT MODEL]:', err);
    });
};

const getStylesByProductId = (productId) => {
  // For slow version: Need to build the style object here
  // using additional queries to photos and skus
  const query = {
    text: `
    SELECT
      id AS "style_id",
      name,
      original_price,
      sale_price,
      default_style AS "default?",
      (SELECT json_object_agg(id, json_build_object('quantity', quantity, 'size', size))
        FROM skus WHERE style_id = s.id) AS skus,
      (SELECT json_agg(ph)
        FROM (SELECT url, thumbnail_url FROM photos WHERE style_id = s.id) AS ph) AS photos
      FROM styles AS s WHERE s.product_id = $1`,
    values: [productId],
  };
  return db.query(query)
    // eslint-disable-next-line arrow-body-style
    .then((result) => {
      const styles = { product_id: productId, results: result.rows };
      // console.log('[PRODUCT MODEL]: Styles', styles);
      return styles;
    })
    .catch((err) => {
      console.log('[PRODUCT MODEL]:', err);
    });
};

const getProductById = (productId) => {
  const query = {
    text: 'SELECT * FROM product WHERE id = $1',
    values: [productId],
  };
  return Promise.all([
    db.query(query),
    getFeaturesByProductId(productId),
  ])
    .then((results) => {
      const product = {
        ...results[0].rows[0],
        features: results[1],
      };
      // console.log('[PRODUCT MODEL]: Product:', product);
      return product;
    })
    .catch((err) => {
      console.log('[PRODUCT MODEL]:', err);
      return err;
    });
};

const getProducts = (page = 1, count = 5) => {
  const lowerLimit = (page * count) - count + 1;
  const upperLimit = (page * count);
  // console.log(`[PRODUCT MODEL]: Getting ids >= ${lowerLimit} and <= ${upperLimit}`);
  const query = {
    text: `SELECT id, name, slogan, description, category, default_price
      FROM product WHERE id >= $1 AND id <= $2`,
    values: [lowerLimit, upperLimit],
  };
  return db.query(query)
    .then((results) => results.rows);
};

module.exports.getProducts = getProducts;
module.exports.getRelatedByProductId = getRelatedByProductId;
module.exports.getStyleById = getStyleById;
module.exports.getStylesByProductId = getStylesByProductId;
module.exports.getProductById = getProductById;
