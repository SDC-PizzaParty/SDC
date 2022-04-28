/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';

export const options = {
  // virtual users:
  scenarios: {
    product_products_styles: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 2,
      maxVUs: 100,
    },
  },
};

export default function () {
  // http.get(`http://127.0.0.1:3666/products?page=${Math.floor(Math.random() * 1000)}`);
  // http.get(`http://127.0.0.1:3666/products/${Math.floor(Math.random() * 100000)}`);
  http.get(`http://127.0.0.1:3666/products/${Math.floor(Math.random() * 1000)}/styles`);
}
