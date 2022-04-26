/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  // virtual users:
  scenarios: {
    products_styles: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 2,
      maxVUs: 50,
    },
  },
};

export default function () {
  // http.get(`http://127.0.0.1:3666/products/${Math.floor(Math.random() * 99999)}`);
  http.get(`http://127.0.0.1:3666/products/${Math.floor(Math.random() * 100000)}/styles`);
}
