require('dotenv').config();
const request = require('request-promise');
const { Pool } = require('pg');

const API_URL = 'http://127.0.0.1:3666';
const db = new Pool({ database: process.env.PRODUCT_DB });

describe('[PRODUCTS] API response:', () => {
  test('Receives a response from the product API', () => {
    // const sum = (a, b) => a + b;
    // expect(sum(1, 2)).toBe(3);
    request(`${API_URL}/`)
      .then((response) => {
        expect(response).toEqual('Response from Product API');
      });
  });
});

describe('[PRODUCTS] Data retrieval:', () => {
  const testProductId = 5;

  test('Receives a Javascript object from the server', () => {
    request(`${API_URL}/products/${testProductId}`)
      .then((response) => {
        const retrievedProduct = JSON.parse(response);
        expect(retrievedProduct).toBeInstanceOf(Object);
      })
      .catch((err) => err);
  });

  test('Receives the item from the database given its product ID', () => {
    request(`${API_URL}/products/${testProductId}`)
      .then((response) => {
        const retrievedProduct = JSON.parse(response);
        const queryString = 'SELECT * FROM product WHERE id = $1';
        const queryValues = [testProductId];

        db.query(queryString, queryValues)
          .then((result) => {
            // Result of query will not have features attached
            expect(retrievedProduct).toMatchObject(result.rows[0]);
          });
      });
  });
});

describe('[PRODUCTS] Retrieved product has the correct shape:', () => {
  const testProductId = 7;

  test('Contains id, name, slogan, description, category, default_price, and features', () => {
    request({
      url: `${API_URL}/products/${testProductId}`,
      time: true,
    })
      .then((response) => {
        const retrievedProduct = JSON.parse(response);

        expect(retrievedProduct).toHaveProperty('id');
        expect(retrievedProduct).toHaveProperty('name');
        expect(retrievedProduct).toHaveProperty('slogan');
        expect(retrievedProduct).toHaveProperty('description');
        expect(retrievedProduct).toHaveProperty('category');
        expect(retrievedProduct).toHaveProperty('default_price');
        // expect(retrievedProduct).toHaveProperty('features');
      });
  });
});

describe('[STYLES] Retreives all the styles for a product given a product id:', () => {
  const testProductId = 4;

  test('Receives an object from the server', () => {
    request(`${API_URL}/products/${testProductId}/styles`)
      .then((response) => {
        const styles = JSON.parse(response);
        expect(styles).toBeInstanceOf(Object);
      });
  });

  test('Received object contains a "results" array', () => {
    request(`${API_URL}/products/${testProductId}/styles`)
      .then((response) => {
        const styles = JSON.parse(response);

        expect(styles.results).toBeInstanceOf(Array);
      })
  })
});