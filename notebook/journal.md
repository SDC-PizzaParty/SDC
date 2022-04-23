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
