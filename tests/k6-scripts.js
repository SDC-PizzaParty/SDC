/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  // virtual users:
  vus: 10,
  duration: '30s',
};

export default function () {
  http.get('http://127.0.0.1:3666/products/1');
  http.get('http://127.0.0.1:3666/products/1/styles');
  sleep(1);
}
