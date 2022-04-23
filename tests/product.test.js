require('dotenv').config();
const request = require('request-promise');
const { Pool } = require('pg');

const API_URL = 'http://127.0.0.1:3666';
const API_TEST_URL = 'http://127.0.0.1:3666/test';
const db = new Pool({ database: process.env.PRODUCT_DB });

describe('Product API response', () => {
  test('Receives a response from the product API', () => {
    // const sum = (a, b) => a + b;
    // expect(sum(1, 2)).toBe(3);
    request(`${API_URL}/`)
      .then((response) => {
        expect(response).toEqual('Response from Product API');
      });
  });
});

describe('Product API data retrieval [PRODUCTS]:', () => {
  const testProductId = 5;

  test('Receives a Javascript object from the server', () => {
    request(`${API_TEST_URL}/${testProductId}`)
      .then((response) => {
        const parsedResponse = JSON.parse(response);
        expect(parsedResponse).toBeInstanceOf(Object);
      });
  });

  test('Receives the item from the database given its product ID', () => {
    request(`${API_TEST_URL}/${testProductId}`)
      .then((response) => {
        const parsedResponse = JSON.parse(response);
        const queryString = 'SELECT * FROM product WHERE id = $1';
        const queryValues = [testProductId];

        // Matchers to explore:
        // toMatchObject -> match the general 'gist' of an object

        db.query(queryString, queryValues)
          .then((result) => {
            expect(parsedResponse).toBe(result.rows[0]);
          });
      });
  });
});
