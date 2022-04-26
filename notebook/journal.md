
# 4/21/22:
- I had to figure out how to get node-postgres working.
- I'm trying to future proof my code by using environment variables and global constant where I *think* I'll need them. It's hard to tell where I'll need them, but I can make my best guesses.

### Environment variables:
- I'm creating a connection object in my db.js file where I am handling my connection to the postgres database. From my experience with mongo, this was where I could plug in my live database from

## MVC architecture and 'benchmark' method:
- I'm creating a benchmark method in my product model so that maybe I can calculate my stats programatically

## Benchmarking:
- What I need to benchmark: I need to find out how long it takes to do a "full" product item query. This includes:
  - Query to product table for product id
  - Query to features table where product id is current id
  - Query to styles table where product id is the current id
    - Queries to photos table where style id is all style ids found
    - Queries to skus table where style ids are all style ids found

## Developing the queries
- [ ] Generate query for retrieving all the photos associated with a product:
`SELECT url FROM photos JOIN styles ON style_id = styles.id AND styles.product_id = 1;`
- [ ] Query for retrieving all skus associated with a product
  - Probably requires multiple joins

  For the queries that look the same I need to essentially "pre-join" the table for faster querying

# 4/22/21

## Using cURL to benchmark:
- I can use cURL to benchmark my request speed using the -w flag
- https://curl.se/docs/manpage.html#-w
- Using `-w "%{total_time}"` gets me the total time of the request
  - using `-w "\n%{total_time}\n"` makes it look prettier

## Getting the styles query:
- The challenge is gonna be getting it into the correct shape:
  - Specifically getting photos query into the style object
  - Getting skus result to be a nested object:
  `{ID:{qty, size}, ID:{qty, size}`

## Getting skus by product ID query:
- This one is quite invloved since it involves multiple queries for each product for every style
- I've already written a getSku by Style ID method. I will now make a get skus by product ID method.
    - Actually I won't do that since it would incur another query. I will just build on my current getStylesMethod
    - Added a getStyleById method. Product and style getters are essentiually the same.

## Style getting:
- Photos take a while to fetch from the db. Fetching a single style, with all of its skus and photos is taking a while now.
- I made a get route to test style getting and will benchmark it now.

## Developing better queries:
- I'm going to start working on an optimized query for getting the styles by product ID since that one is the longest and I think I'll be able to see the biggest change in request time if I work on this one first;
  - It currently does a minimum of 4 queries to get all the info needed.
  - fetch-product -> fetch-style-ids -> (fetch-style -> fetch-skus -> fetch-photos) x n
  - To break this down further, I'm going to make an 'equivalent' query to my get style by id method.

### Query style + skus by style ID:
- Selecting all skus for style `5`:
```
SELECT skus.id, quantity, size, name, original_price, sale_price, default_style FROM skus JOIN styles ON style_id = styles.id AND styles.id = 5;
-->
 id | quantity | size |       name       | original_price | sale_price | default_style
----+----------+------+------------------+----------------+------------+---------------
 25 |        8 | XS   | Sky Blue & White |        $140.00 |    $100.00 | f
 26 |       16 | S    | Sky Blue & White |        $140.00 |    $100.00 | f
 27 |       17 | M    | Sky Blue & White |        $140.00 |    $100.00 | f
 28 |       10 | L    | Sky Blue & White |        $140.00 |    $100.00 | f
 29 |       15 | XL   | Sky Blue & White |        $140.00 |    $100.00 | f
 30 |        6 | XXL  | Sky Blue & White |        $140.00 |    $100.00 | f
 ```
- Lets add in the photos:
```
SELECT skus.id, quantity, size, name, original_price, sale_price, default_style, url, thumbnail_url FROM skus JOIN styles ON style_id = styles.id JOIN photos ON photos.style_id = skus.style_id AND styles.id = 5;
```
  - Result was that I x6'd the number of rows I got back. This is because there are 6 unique images for this style. 6 photos x 6 skus -> 36 results.
  - Maybe I cant use a right join to reduce the amount of duplicate data coming back? Currently I'm getting 6 copies of each photo (one for each unique sku). What if I only want to keep the B portion of this join?
  ```
  SELECT styles.id, skus.id, photos.id, size FROM skus INNER JOIN styles ON style_id = styles.id INNER JOIN photos ON photos.style_id = skus.style_id AND styles.id = 5;
  -->
  sty | sku | p | siz
  ----+----+----+------
    5 | 25 | 25 | XS
    5 | 26 | 25 | S
    5 | 27 | 25 | M
    5 | 28 | 25 | L
    5 | 29 | 25 | XL
    5 | 30 | 25 | XXL
    5 | 25 | 27 | XS
    5 | 26 | 27 | S
    5 | 27 | 27 | M
    5 | 28 | 27 | L
    5 | 29 | 27 | XL
    5 | 30 | 27 | XXL
    5 | 25 | 28 | XS
    5 | 26 | 28 | S
    5 | 27 | 28 | M
    5 | 28 | 28 | L
    5 | 29 | 28 | XL
    5 | 30 | 28 | XXL
    5 | 25 | 29 | XS
    5 | 26 | 29 | S
    5 | 27 | 29 | M
    5 | 28 | 29 | L
    5 | 29 | 29 | XL
    5 | 30 | 29 | XXL
    5 | 25 | 30 | XS
    5 | 26 | 30 | S
    5 | 27 | 30 | M
    5 | 28 | 30 | L
    5 | 29 | 30 | XL
    5 | 30 | 30 | XXL
    5 | 25 | 26 | XS
    5 | 26 | 26 | S
    5 | 27 | 26 | M
    5 | 28 | 26 | L
    5 | 29 | 26 | XL
    5 | 30 | 26 | XXL
  ```
  - Is it possible to pair this table down without losing any of the unique information? -> I dont think so. To get the unique skus and photos out, I now need to query THIS table. (So I have a result with unique values in the rows)

# 4/23/21

## Testing:
The importance of testing finally starting to become aparent. I want to write Tests (with a capital 'T') on my un-optimized API that test its basic functionality before I do my optimizations.
- The tests should still be viable with the optimized API.
- Saves times troubleshooting issues that are not related to optimization.
I'm gonna try to write some basic tests.
- Today I learned that you need to set the property "jest" to `true` in the `env` object of the `.eslintrc.js` file so that the jest functions are not linted.
  - This is because we're not explicitly importing the functions such as 'test' and 'expect' etc.

### What to test for:
- Check that there is a response from the route
- Check that when the response data is parsed, it contains an object with a property called 'product_id'

## Notes for deployment:
- Can I import my seeded database to AWS somehow? Or do I need to deal with using these CSVs and seeding on the server?

# 4/25/22

## Full-stack
- I probably want to plug in the front-end to my unoptimized back-end today. This might give me a little bit more insight into the type of unit tests I'll need for my back-end before moving on to optimization.
- I'll continue practicing SQL syntax and joins whenever I have time today. It's starting to become a little more natural. Mocking out tables by hand is really helpful so I'll do that some more.

## Testing
- In the middle of plugging in the front-end I realized that I needed more unit tests. I then stumbled across the `time` option that can be provided in the node `requests` module. When `time` is set to `true` then a bunch of useful properties are added to the response object:
  - `elapsedTime` Duration of the entire request/response in milliseconds (deprecated).
  - `timings`: object containing various timings:
    - `timings.connect`: timestamp when the server acknowledges TCP connection.
    - `timings.response`: First bytes are received from the server
    - `timings.end` Last bytes are received from server *This is probably our jam*
- I also just realized that I could have been using axios for the tests, but I'm glad I got to practice using a new module. . .
- I'm wondering if axios supports a setHeader for all requests type of thing like jQuery does.
- It doesn't seem like Jest is waiting for the tests to complete before moving on the next one.
  - Or maybe its receiving the object and the shap, but the values are still streaming.
- I just learned that there are tools to perform the local service stress test for me: k6 is one of them.
- **Also, I don't need to be hooking up the front-end today...**

#### New technologies:
- node request
- k6

## My tests are not failing when they should
- I am going to try using the non-promise version of requests. I have a feeling that this weird behavior might be due to the promise api

## Using K6 to stress test my service
- I have to work through the getting started guide, but I've made my first test (simple call to product id 1)
![My first k6 test](https://user-images.githubusercontent.com/5285119/165193321-5aa1ff0c-7abb-40d8-b454-9b18b6a18f6b.png)
- Attemping to test with 10 virtual users loading product 1 with all of its styles:
![K6 test with styles](https://user-images.githubusercontent.com/5285119/165202588-25bd502d-4884-42e3-a8ad-e39ed903aff2.png)
- Attempted 10 RPS stress test on styles route only: Average time: `20.1s`. I talk about this below.

## Optimizing queries:
### Using views to get product data:
- K6 stress test for product request at 10 RPS:
![K6 10 RPS products only](https://user-images.githubusercontent.com/5285119/165212343-068d68cc-e752-4fac-aae4-5915d7ba7621.png)
  - `86.89ms`, not bad as styles, but still not under `50ms`
- Creating the view as a query:
```
CREATE VIEW p_f AS SELECT name, category, feature, value FROM product INNER JOIN features ON product.id = product_id AND product.id = 1;
```
- This results in the saved join table:
```
SELECT * FROM p_f;
    name     | category | feature | value
-------------+----------+---------+--------
 Camo Onesie | Jackets  | Fabric  | Canvas
 Camo Onesie | Jackets  | Buttons | Brass
(2 rows)
```
- That I can now query for specific information:
```
SELECT name, category FROM p_f LIMIT 1;
    name     | category
-------------+----------
 Camo Onesie | Jackets
(1 row)

SELECT feature, value FROM p_f;
 feature | value
---------+--------
 Fabric  | Canvas
 Buttons | Brass
(2 rows)
```
- By using `GROUP BY` I can collapse rows of the result onto the given columns:
```
SELECT name, category FROM p_f GROUP BY name, category;
    name     | category
-------------+----------
 Camo Onesie | Jackets
(1 row)
```
- Now I only created one view in this example. if I pre-join the entire product/features tables then I can save one query. However, I would still need two queries to get the individual features and product data. Otherwise, I would need to separate the features data from the product data in javascript.
- **For this optimization I'm simply going to index features product_id to speed up searching and use two queries.**
- After indexing features by product_id:
![K6 product 10RPS optimized](https://user-images.githubusercontent.com/5285119/165222722-3b0e4037-577d-4dc5-bffd-fae8cb8b2d31.png)

### Speeding up photo getting
- Getting one column for one style id takes `341ms`.
```
  Gather  (cost=1000.00..239282.60 rows=15 width=128) (actual time=196.095..341.473 rows=6 loops=1)
   Workers Planned: 2
   Workers Launched: 2
   ->  Parallel Seq Scan on photos  (cost=0.00..238281.10 rows=6 width=128) (actual time=289.067..336.965 rows=2 loops=3)
         Filter: (style_id = 6)
         Rows Removed by Filter: 1885152
 Planning Time: 0.043 ms
 Execution Time: 341.815 ms
(8 rows)
```
- After indexing by style_id: `0.229ms`

### Using views to get style data:
- This query is more complicated and invloves joining 2 or 3 tables: photos, skus, and styles.
- K6 stress test on my unoptimized api at 10 rps:
![K6 10 RPS to styles](https://user-images.githubusercontent.com/5285119/165212336-a47058fa-e90f-41ba-96c1-9a287307e97f.png)
  - Average time: `20.1s`
- The tables are probably the least CPU intensive to join are skus and styles, since photos contain large strings and there can be an unlimited number of photos for each style id.
- skus are much more predictable in that there probably won't be that much variation in sizes and the data is generally small.
- First step will be to index skus and photos by style_id.
  - stress test @ 10 RPS after indexing:
  ![Style stress indexed 10rps](https://user-images.githubusercontent.com/5285119/165223928-dcd9c636-ce02-48f2-881a-b4e0d77e9109.png)
  - At 100 RPS:
  ![Styles stress test 100rps](https://user-images.githubusercontent.com/5285119/165224161-33368f77-6039-4567-b736-288955fe8ca6.png)

# 4/26/22

### Planning for the day:
- Write a route for /products -> to return paginated results of products
  - Add it to my benchmark table
- Create a benchmark table (10, 100, 1000) for pre-optimized values
  - Create a new table for each optimization
- Deploy to AWS
  - Use `nginx` for load balancing
  - Then do scaling on deployed version (this can probably be work for tomorrow)

### Keeping track of my stress tests:
- I created a table to put stuff into:
```
Table "public.benchmarks"
     Column     |  Type   |
----------------+---------+----------
 id             | integer | serial
 optimization   | text    |
 rps            | integer |
 service        | text    |
 total_duration | numeric |
 fail_rate      | numeric | default=0
```
  - This should also make it easier to fish out for my journaling.

### Updates to stress test script:
```
import http from 'k6/http';

export const options = {
  // virtual users:
  scenarios: {
    product_products_styles: {
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
  // Un-comment to test
  http.get(`http://127.0.0.1:3666/products?page=${Math.floor(Math.random() * 1000)}`);
  // http.get(`http://127.0.0.1:3666/products/${Math.floor(Math.random() * 100000)}`);
  // http.get(`http://127.0.0.1:3666/products/${Math.floor(Math.random() * 10000)}/styles`);
}
```
- The above script does a few key things:
  - Uses a random number to query for productId or page number
  - Pings at a constant rate. In this case it's set to 10 RPS
- I'm only testing these three routes because the fourth route (related items) is only responsible for fetching an array of numbers
  - **explicitly: I'm not testing this part out of laziness. What could go wrong?**

### I'm supposed to deploy today
- [ ] How do I load my database?
  - [x] Install postgres on the ubuntu server
  - [x] Add a postgres user account 'ubuntu'
  - [x] Build my tables using my schema file in this repo
  - [ ] Host the CSV's somewhere (temporarily) so I can seed from them?
    - I'm not sure how this step works
    - Can I use fileson my local machine when interacting with EC2 instance via SSH?
    - I'm trying to figure out the keywords to Google. .
    - Upon some searching I eventually stumbled across this guide for transferring files to an EC2 instance in Windows. The example was using a command line program called 'PSCP'. I googled PSCP and saw videos with titles of the gist of "how to copy files remote"
    - This led to my current google results page for searching: `how to copy files to a remote server mac` These results seem promising because it mentions a command line program called 'SCP'. . . This sounds very similar to 'PSCP' so I think i found what I'm looking for.
      - I clicked a link to open the `scp command man page` and it opened a terminal window with this beautiful guide:
      ![SCP man page](https://user-images.githubusercontent.com/5285119/165405088-15536490-6408-436c-9c9d-39b10a56ced2.png)