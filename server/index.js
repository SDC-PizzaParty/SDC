/* eslint-disable global-require */
/* eslint-disable no-console */
require('dotenv').config();

const fs = require('fs');
const ip = require('ip').address();

if (process.env.MODE === 'LB') {
  console.log('Starting load balancer on:', ip);
  require('./loadbalancer');
} else if (process.env.MODE === 'SERVICE') {
  console.log('Starting service on:', ip);
  require('./api/product');
} else if (process.env.MODE === 'DUAL') {
  console.log('Running in dual service/load balancer mode on:', ip);
  require('./loadbalancer');
  require('./api/product');
}

if (process.env.LOADER_IO) {
  const filename = `loader/${process.env.LOADER_IO}.txt`;
  fs.writeFile(filename, process.env.LOADER_IO, (err) => {
    if (err) {
      console.log('Error loading Loader.io key:', err);
    } else {
      console.log('Loader.io config loaded');
    }
  });
}
