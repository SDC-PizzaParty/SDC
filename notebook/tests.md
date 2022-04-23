## Unoptimized API tests (making multiple queries to db and building object in js):

### Primitive get product by ID request:
- The test route: `127.0.0.1:3666/test/2001`
- I'll be using cURL to test the API. I've written this route to return the stringified object it receives from the call to the product model module which interacts with the db module.
- The test command:
`$ curl 127.0.0.1:3666/test/2001`
- Response:
```
{"id":2001,"name":"Destiny Shorts","slogan":"Architecto mollitia doloremque dolor est nobis aut tempore laudantium veniam.","description":"Eum expedita itaque voluptate doloremque sunt cupiditate qui. Ut a qui modi qui dolor dicta dolor libero ut. Animi ut ad nobis et neque. Vitae ut atque minus cumque mollitia in illo consequuntur. Veritatis ut et rerum et ut omnis amet eaque. Aut est molestias.","category":"Shorts","default_price":"$10.00","features":[{"feature":"Lifetime Guarantee","value":"null"},{"feature":"Green Leaf Certified","value":"null"},{"feature":"5 Year Warranty","value":"null"}]}
```
- The response is accurate as far as I can tell so that's good.
- Command for the speed test:
`$ curl 127.0.0.1:3666/test/2001 -w "\n%{time_total}\n"`
  - Using the `-w` cURL flag to write out information after a completed transfer. I can give it a template string to print out certain variables. Here I'm getting `total_time`
- Response:
```
{"id":2000,"name":"Dorris Trousers","slogan":"Eum quo natus est necessitatibus ut aut quis.","description":"Nostrum beatae ut quidem fugiat doloremque. Voluptatem qui occaecati qui quo. Nostrum vitae praesentium perferendis consectetur consequatur dolores quas distinctio omnis. Ut et quia necessitatibus beatae voluptas delectus voluptatem. Ratione quod et aut maxime unde delectus.","category":"Trousers","default_price":"$466.00","features":[{"feature":"Lens","value":"Ultrasheen Gold"},{"feature":"Non-GMO","value":"null"}]}
0.316061
```
- The total time for the request is a blazing `0.316061` seconds.
- What this function is doing:
  - This getter relies on making two queries:
  ```
  SELECT feature, value FROM features WHERE product_id = id
  ```
  - And extending the result onto the row given by:
  ```
  SELECT * FROM product WHERE id = id
  ```
  - We can probably get a lot faster by simply joining tables.
    - Probably even faster if the tables are 'pre-joined'


### Primative style by ID request:
- The test route: `127.0.0.1:3666/test/style/:styleId`
- Command `$ curl 127.0.0.1:3666/test/style/5 -w "\n%{time_total}\n"`
    - Response: `0.365`, Actually better than I thought
- Running one that is probably not cached by postgres: `127.0.0.1:3666/test/style/14`
    - Response: `0.371`s, although there were no photos for this style. Photos seem to slow down the db a lot.
    - Content:
    ```
    {
      id: 14,
      product_id: 3,
      name: 'Maroon',
      sale_price: '$35.00',
      original_price: '$40.00',
      default_style: false,
      skus: {
        '55': { quantity: 8, size: 'XS' },
        '56': { quantity: 16, size: 'S' },
        '57': { quantity: 10, size: 'L' },
        '58': { quantity: 17, size: 'M' },
        '59': { quantity: 15, size: 'XL' },
        '60': { quantity: 6, size: 'XXL' }
      },
      photos: []
    }
    ```
- Search method:
  - Get the style by id:
  ```
  SELECT * FROM style WHERE id = id
  ```
  - Get the photos by style id:
  ```
  SELECT thumbnail_url, url FROM photos WHERE style_id = id
  ```
  - Get the skus by style id:
  ```
  SELECT * FROM skus WHERE style_id = id
  ```
    - I then have to do some data parsing to get the skus to be an object
  - Bundle these together and send it

### Primative get styles by product id request:
- Search method:
  - This one is slowest because it relies on asynchronous queries. I need to make a query to get the next query parameters
  - Get the style ids by product id:
  ```
  SELECT id FROM style WHERE product_id = id
  ```
    - Then for each style id, get the style
Tests:
- I made a route that combines all of the necessary data to create a complete array of styles for any particular product:
- Request: `127.0.0.1:3666/test/styles/5`
  - Response time: `1.412111s`
  - Full response value:
  ```
  {
    product_id: '5',
    results: [
      {
        id: 26,
        product_id: 5,
        name: 'White & White',
        sale_price: null,
        original_price: '$99.00',
        default_style: true,
        skus: [Object],
        photos: []
      },
      {
        id: 27,
        product_id: 5,
        name: 'White & Red',
        sale_price: null,
        original_price: '$99.00',
        default_style: false,
        skus: [Object],
        photos: []
      },
      {
        id: 28,
        product_id: 5,
        name: 'White & Black',
        sale_price: null,
        original_price: '$99.00',
        default_style: false,
        skus: [Object],
        photos: []
      },
      {
        id: 29,
        product_id: 5,
        name: 'White & Blue',
        sale_price: null,
        original_price: '$99.00',
        default_style: false,
        skus: [Object],
        photos: []
      }
    ]}
  ```
- Markedly slower when styles contain photo urls: Request: `127.0.0.1:3666/test/styles/1`
  - Response time: `2.024271s`
  - Response value:
  ```
  {
  product_id: '1',
  results: [
    {
      id: 1,
      product_id: 1,
      name: 'Forest Green & Black',
      sale_price: null,
      original_price: '$140.00',
      default_style: true,
      skus: [Object],
      photos: [Array]
    },
    {
      id: 2,
      product_id: 1,
      name: 'Desert Brown & Tan',
      sale_price: null,
      original_price: '$140.00',
      default_style: false,
      skus: [Object],
      photos: [Array]
    },
    {
      id: 3,
      product_id: 1,
      name: 'Ocean Blue & Grey',
      sale_price: '$100.00',
      original_price: '$140.00',
      default_style: false,
      skus: [Object],
      photos: [Array]
    },
    {
      id: 4,
      product_id: 1,
      name: 'Digital Red & Black',
      sale_price: null,
      original_price: '$140.00',
      default_style: false,
      skus: [Object],
      photos: [Array]
    },
    {
      id: 5,
      product_id: 1,
      name: 'Sky Blue & White',
      sale_price: '$100.00',
      original_price: '$140.00',
      default_style: false,
      skus: [Object],
      photos: [Array]
    },
    {
      id: 6,
      product_id: 1,
      name: 'Dark Grey & Black',
      sale_price: null,
      original_price: '$170.00',
      default_style: false,
      skus: [Object],
      photos: [Array]
    }
  ]}
  ```

### Primative full product request (unnecessary):
- Request: `127.0.0.1:3666/test/5`
  - Response time: `1.393812s`
  - Response value:
  ```
  {
  id: 5,
  name: 'Heir Force Ones',
  slogan: 'A sneaker dynasty',
  description: "Now where da boxes where I keep mine? You should peep mine, maybe once or twice but never three times. I'm just a sneaker pro, I love Pumas and shell toes, but can't nothin compare to a fresh crispy white pearl",
  category: 'Kicks',
  default_price: '$99.00',
  features: [
    { feature: 'Sole', value: 'Rubber' },
    { feature: 'Material', value: 'FullControlSkin' },
    { feature: 'Mid-Sole', value: 'ControlSupport Arch Bridge' },
    { feature: 'Stitching', value: 'Double Stitch' }
  ],
  product_id: '5',
  results: [
    {
      id: 26,
      product_id: 5,
      name: 'White & White',
      sale_price: null,
      original_price: '$99.00',
      default_style: true,
      skus: [Object],
      photos: []
    },
    {
      id: 27,
      product_id: 5,
      name: 'White & Red',
      sale_price: null,
      original_price: '$99.00',
      default_style: false,
      skus: [Object],
      photos: []
    },
    {
      id: 28,
      product_id: 5,
      name: 'White & Black',
      sale_price: null,
      original_price: '$99.00',
      default_style: false,
      skus: [Object],
      photos: []
    },
    {
      id: 29,
      product_id: 5,
      name: 'White & Blue',
      sale_price: null,
      original_price: '$99.00',
      default_style: false,
      skus: [Object],
      photos: []
    }
  ]}
  ```
- I then realized that getting the "full" product with styles is not a function of the original API. . .