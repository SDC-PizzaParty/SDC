/* eslint-disable global-require */
/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

axios.get('https://myexternalip.com/raw')
  .then(({ data }) => {
    console.log(`[CONFIG] App running at: ${data}`);
  })
  .catch((err) => {
    console.log(err);
  });

// Packaging up Loader.io key and serving it up
if (process.env.LOADER_IO) {
  const filename = `static/${process.env.LOADER_IO}.txt`;
  fs.writeFile(filename, process.env.LOADER_IO, (err) => {
    if (err) {
      console.log('[CONFIG] Error loading Loader.io key:', err);
    } else {
      console.log('[CONFIG] Loader.io config loaded');
    }
  });
}
