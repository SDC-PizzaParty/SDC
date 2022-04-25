require('dotenv').config();
const request = require('request');
// const request = require('request-promise');
const { Pool } = require('pg');

const API_URL = 'http://127.0.0.1:3666';
const db = new Pool({ database: process.env.PRODUCT_DB });

describe('[PRODUCTS] API response:', () => {
  test('Receives a response from the product API', () => {
    // const sum = (a, b) => a + b;
    // expect(sum(1, 2)).toBe(3);
    request(`${API_URL}/`, (err, response) => {
      expect(response.body).toEqual('Response from Product API');
    });
  });
});

describe('[PRODUCTS] Data retrieval:', () => {
  const testProductId = 5;

  test('Receives a Javascript object from the server', () => {
    request(`${API_URL}/products/${testProductId}`, (err, response) => {
      const retrievedProduct = JSON.parse(response.body);
      expect(retrievedProduct).toBeInstanceOf(Object);
    });
  });

  test('Receives the item from the database given its product ID', () => {
    request(`${API_URL}/products/${testProductId}`, (err, response) => {
      const retrievedProduct = JSON.parse(response.body);
      const queryString = 'SELECT * FROM product WHERE id = $1';

      db.query(queryString, [testProductId])
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
    request(`${API_URL}/products/${testProductId}`, (err, response) => {
      const retrievedProduct = JSON.parse(response.body);

      expect(retrievedProduct).toHaveProperty('id');
      expect(retrievedProduct).toHaveProperty('name');
      expect(retrievedProduct).toHaveProperty('slogan');
      expect(retrievedProduct).toHaveProperty('description');
      expect(retrievedProduct).toHaveProperty('category');
      expect(retrievedProduct).toHaveProperty('default_price');
      expect(retrievedProduct).toHaveProperty('features');
    });
  });
});

describe('[STYLES] Retreives all the styles for a product given a product id:', () => {
  const testProductId = 4;

  test('Receives an object from the server', () => {
    request(`${API_URL}/products/${testProductId}/styles`, (err, response) => {
      const styles = JSON.parse(response.body);

      expect(styles).toBeInstanceOf(Object);
    });
  });

  test('Received object contains a "results" array', () => {
    request(`${API_URL}/products/${testProductId}/styles`, (err, response) => {
      const styles = JSON.parse(response.body);

      expect(styles.results).toBeInstanceOf(Array);
    });
  });

  test('Array of styles is the correct length', () => {
    // This is a test that checks if every style was sent from the server
    const query = 'SELECT id FROM styles WHERE product_id = $1';

    request(`${API_URL}/products/${testProductId}/styles`, (err, response) => {
      const stylesFromServer = JSON.parse(response.body).results;
      db.query(query, [testProductId])
        .then((result) => {
          const styleIdsFromDB = result.rows;
          expect(stylesFromServer.length).toEqual(styleIdsFromDB.length);
        });
    });
  });
});

describe('[STYLES] Style object shape:', () => {
  const testProductId = 8;

  test('Contains a name, original_price, sale_price, default?, photos, skus, and style_id', () => {
    request(`${API_URL}/products/${testProductId}/styles`, (err, response) => {
      const styles = JSON.parse(response.body);

      expect(styles.results[0].toHaveProperty('name'));
      expect(styles.results[0].toHaveProperty('original_price'));
      expect(styles.results[0].toHaveProperty('sale_price'));
      expect(styles.results[0].toHaveProperty('photos'));
      expect(styles.results[0].toHaveProperty('skus'));
      expect(styles.results[0].toHaveProperty('default?'));
      expect(styles.results[0].toHaveProperty('style_id'));
    });
  });
});
