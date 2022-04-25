# JOURNAL:

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