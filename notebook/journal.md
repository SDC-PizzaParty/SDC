
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
  - [ ] Seed my database on the EC2 instance. . . I'm not sure how to do this yet

  #### Transferring files to my EC2 instance:
  - Some thinking around how I can do this:
  - [ ] Host the CSV's somewhere (temporarily) so I can seed from them?
  - Can I use files on my local machine when interacting with EC2 instance via SSH?
  - I'm trying to figure out the keywords to Google. .
  - Upon some searching I eventually stumbled across this guide for transferring files to an EC2 instance in Windows. The example was using a command line program called 'PSCP'. I googled PSCP and saw videos with titles of the gist of "how to copy files remote"
  - This led to my current google results page for searching: `how to copy files to a remote server mac` These results seem promising because it mentions a command line program called 'SCP'. . . This sounds very similar to 'PSCP' so I think i found what I'm looking for.
    - I clicked a link to open the `scp command man page` and it opened a terminal window with this beautiful guide:
    ![SCP man page](https://user-images.githubusercontent.com/5285119/165405088-15536490-6408-436c-9c9d-39b10a56ced2.png)
  - I used SCP (OpenSSH file copy) to transfer my seed data to my EC2 instance:
  ```
  scp -i 'path/to/pem-key.pem' path/to/csv.csv ubuntu@ec2-xx-XX-xx-XX.amazon.aws.com:/home/ubuntu/SDC-1
  ```
    - This did the trick
  #### Just learned about `pg_dump`
  - Apparently Postgres already thought about a way to like transfer your database to another server. Genius.
  - Amazon also pointed this out to me: https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/migrate-an-on-premises-postgresql-database-to-amazon-ec2.html

  #### A unique challenge today:
  Is doing everything through the command line on the EC2 instance. It's quite fun and intriguing.

# 4/27/22

### Planning for the day:
- [ ] Set up an EC2 instance with just the database
- [ ] Set up and additional EC2 instance with the service
- [ ] Connect the service to the deployed database

### Deploying my database:
- I used `pg_dump` to backup my database to a sql file. It was `2.6gb` so I think it contains all the data. This is something I was unsure about before.
  - Command for this was very simple. I used the defaults for everything:
  - `$pg_dump sdc > db.sql`
- I created a new EC2 instance running ubuntu with 8gb of storage.
- Installed postgresql: `sudo apt install postgresql` using *EC2 Instance Connect*
  - No need to install Node here
- From my pc I used `scp` to send the backup database to my new EC2 instance: `scp -i new-key.pem db.sql ubuntu@ec2-xxx.amazonaws.com:/home/ubuntu`
  - This took a while and I had to restart multiple times because my computer would go to sleep.
- Back on the server, I had to do some additional psql setup:
  - Postgres installs with a user `postgres` by default, so I wanted to create a new user called `ubuntu` so I can setup from it:
  - Log in to `postgres` account on server: `$ sudo -i -u postgres`
  - Open psql and create a new user with super powers:
  ```
  postgres~$ psql
  >=# CREATE USER ubuntu WITH SUPERUSER;
  CREATE USER
  ```
- Back on the server @ubuntu: I created a fresh database named 'sdc': `ubuntu~$ createdb sdc`
- Then I loaded the newly created db using the script that I just dumped: `$ psql -d sdc -f db.sql`
   - *Then I ran out of space*
   - Next time increase the space on the EC2 volume first... Anyway:
   - [Using this guide:](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html)
   - Expand volume size from console
   - `$ lsblk`
   ```
   NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
  loop0     7:0    0   25M  1 loop /snap/amazon-ssm-agent/4046
  loop1     7:1    0 55.5M  1 loop /snap/core18/2253
  loop2     7:2    0 61.9M  1 loop /snap/core20/1242
  loop3     7:3    0 67.2M  1 loop /snap/lxd/21835
  loop4     7:4    0 42.2M  1 loop /snap/snapd/14066
  xvda    202:0    0   15G  0 disk
  └─xvda1 202:1    0   15G  0 part /
   ```
   - `$ sudo growpart /dev/xvda 1`
   - `$ sudo resize2fs /dev/root`
   - check with: `$ df -h`
- Created a user called `remote` in psql: `CREATE USER remote WITH PASSWORD 'i used a pw here';` that I will use to connect to the db remotely.

### Connecting to my deployed database:
- I know that postgres (by default) will run on port 5432, but what about authentication?
  - [ ] Setup a password once I restore the db on EC2.
- [ ] Lets try to first connect to it from my machine.
  - [ ] I should be able to alter my Pool connection parameters in `db.js`
  - [ ] Use environment variables so I don't publish my database location or whatever

# 4/28/22

## I came across this section of the postgresql for server administration
- From within the EC2 instance:
```
sdc=# SELECT * FROM pg_file_settings;
               sourcefile                | sourceline | seqno |            name            |                 setting                 | applied | error
-----------------------------------------+------------+-------+----------------------------+-----------------------------------------+---------+-------
 /etc/postgresql/12/main/postgresql.conf |         42 |     1 | data_directory             | /var/lib/postgresql/12/main             | t       |
 /etc/postgresql/12/main/postgresql.conf |         44 |     2 | hba_file                   | /etc/postgresql/12/main/pg_hba.conf     | t       |
 /etc/postgresql/12/main/postgresql.conf |         46 |     3 | ident_file                 | /etc/postgresql/12/main/pg_ident.conf   | t       |
 /etc/postgresql/12/main/postgresql.conf |         50 |     4 | external_pid_file          | /var/run/postgresql/12-main.pid         | t       |
 /etc/postgresql/12/main/postgresql.conf |         64 |     5 | port                       | 5432                                    | t       |
 /etc/postgresql/12/main/postgresql.conf |         65 |     6 | max_connections            | 100                                     | t       |
 /etc/postgresql/12/main/postgresql.conf |         67 |     7 | unix_socket_directories    | /var/run/postgresql                     | t       |
 /etc/postgresql/12/main/postgresql.conf |        101 |     8 | ssl                        | on                                      | t       |
 /etc/postgresql/12/main/postgresql.conf |        103 |     9 | ssl_cert_file              | /etc/ssl/certs/ssl-cert-snakeoil.pem    | t       |
 /etc/postgresql/12/main/postgresql.conf |        105 |    10 | ssl_key_file               | /etc/ssl/private/ssl-cert-snakeoil.key  | t       |
 /etc/postgresql/12/main/postgresql.conf |        122 |    11 | shared_buffers             | 128MB                                   | t       |
 /etc/postgresql/12/main/postgresql.conf |        141 |    12 | dynamic_shared_memory_type | posix                                   | t       |
 /etc/postgresql/12/main/postgresql.conf |        225 |    13 | max_wal_size               | 1GB                                     | t       |
 /etc/postgresql/12/main/postgresql.conf |        226 |    14 | min_wal_size               | 80MB                                    | t       |
 /etc/postgresql/12/main/postgresql.conf |        513 |    15 | log_line_prefix            | %m [%p] %q%u@%d                         | t       |
 /etc/postgresql/12/main/postgresql.conf |        540 |    16 | log_timezone               | Etc/UTC                                 | t       |
 /etc/postgresql/12/main/postgresql.conf |        546 |    17 | cluster_name               | 12/main                                 | t       |
 /etc/postgresql/12/main/postgresql.conf |        562 |    18 | stats_temp_directory       | /var/run/postgresql/12-main.pg_stat_tmp | t       |
 /etc/postgresql/12/main/postgresql.conf |        650 |    19 | datestyle                  | iso, mdy                                | t       |
 /etc/postgresql/12/main/postgresql.conf |        652 |    20 | timezone                   | Etc/UTC                                 | t       |
 /etc/postgresql/12/main/postgresql.conf |        666 |    21 | lc_messages                | C.UTF-8                                 | t       |
 /etc/postgresql/12/main/postgresql.conf |        668 |    22 | lc_monetary                | C.UTF-8                                 | t       |
 /etc/postgresql/12/main/postgresql.conf |        669 |    23 | lc_numeric                 | C.UTF-8                                 | t       |
 /etc/postgresql/12/main/postgresql.conf |        670 |    24 | lc_time                    | C.UTF-8                                 | t       |
 /etc/postgresql/12/main/postgresql.conf |        673 |    25 | default_text_search_config | pg_catalog.english                      | t       |
(25 rows)
```
- I decided to take a look at the contents of the postgresql.conf file since I've seen a lot of mention to it in the documentation.
- `nano /etc/postgresql/12/main/postgresql.conf`:
  - (PHOTO)
  - Some of the info I found interesting here were the listen_addresses (which i believe is where I open up to listening on the internet by adding 0.0.0.0)
  - And that there is a pem key stored somewhere (which i would think is for some kind of authentication option)
  - Attempting to write to this file using nano I got `permission denied`
  - I did `sudo nano /etc/postgresql/12/main/postgresql.conf` then changed listen_addresses to include '0.0.0.0'
  and that took.
### Why i added 0.0.0.0 to postgresql.conf:
- From the Postgres documentation Chapter 20.3.1: `The entry 0.0.0.0 allows listening for all IPv4 addresses`
- From the conf file: `use '*' to enable all addresses`

Awesome video explaining everything: https://youtu.be/LV2ooRnZqpg

## Creating a load balancer with node?
- Can I create a node balancer that distributes incoming traffic one by one within the same repo?
- [x] Create a copy of my product API (express app)
- [x] Direct traffic through a third express app (index/router)
- This split up nicely since my API uses a separated models component
- K6 testing to see if anything improved:
  - Not bad, I dont think theres a difference, but lets try on the server now.
  - I dont think there is any improvement

## Load balancing with NGINX:
- Resource: https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/index.html#prebuilt
- I want to try load balancing with Node for a little bit longer before I resort to Nginx. It would be great if I could figure out what is wrong with mine.