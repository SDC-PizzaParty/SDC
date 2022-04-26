/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';

export const options = {
  // virtual users:
  scenarios: {
    products_styles: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 2,
      maxVUs: 50,
    },
  },
};

export default function () {
  // http.get(`http://127.0.0.1:3666/products/${Math.floor(Math.random() * 100000)}`);
  http.get(`http://127.0.0.1:3666/products/${Math.floor(Math.random() * 10000)}/styles`);
}
