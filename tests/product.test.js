require('dotenv').config();
const request = require('request-promise');
const { Pool } = require('pg');

const API_URL = 'http://127.0.0.1:3666';
const API_TEST_URL = 'http://127.0.0.1:3666/test';
const db = new Pool({ database: process.env.PRODUCT_DB });

test('Receives a response from the product API', () => {
  // const sum = (a, b) => a + b;
  // expect(sum(1, 2)).toBe(3);
  request(`${API_URL}/`)
    .then((response) => {
      expect(response).toEqual('Response from Product API');
    });
});

describe('Product API data retrieval:', () => {
  const testProductId = 5;

  request(`${API_TEST_URL}/${testProductId}`)
    .then((response) => {
      const parsedResponse = JSON.parse(response);

      const queryString = 'SELECT * FROM product WHERE id = $1';
      const queryValues = [testProductId];

      db.query(queryString, queryValues)
        .then((result) => {
          it('Receives the item from the database given its product ID', () => {
            expect(parsedResponse).toBe(result.rows[0]);
          });
        });
    });
});
