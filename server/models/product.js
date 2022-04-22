const db = require('../../database/product/db');

module.exports.benchmark = (queryString, params) => {
  const query = `EXPLAIN ANALYZE ${queryString}`;
  // Expected result.rows[0]:
  // {'QUERY PLAN': 'Gather. . . (actual time=0.359..67.363 rows=6 loops=1)'}
  return db.query(query, params)
    .then((result) => result.rows[0]);
};
