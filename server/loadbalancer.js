require('dotenv').config();

const apiUrls = [];

(() => {
  let num = 1;
  while (process.env[`PRODUCT_API_${num}`]) {
    apiUrls.push(process.env[`PRODUCT_API_${num}`]);
    num += 1;
  }
})();

module.exports = apiUrls;
