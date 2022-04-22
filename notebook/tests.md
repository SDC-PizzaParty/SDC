## Primitive query (making multiple queries to db and building object in js):
- The test request:
`$ curl 127.0.0.1:3666/test/2001`
- Response:
```
{"id":2001,"name":"Destiny Shorts","slogan":"Architecto mollitia doloremque dolor est nobis aut tempore laudantium veniam.","description":"Eum expedita itaque voluptate doloremque sunt cupiditate qui. Ut a qui modi qui dolor dicta dolor libero ut. Animi ut ad nobis et neque. Vitae ut atque minus cumque mollitia in illo consequuntur. Veritatis ut et rerum et ut omnis amet eaque. Aut est molestias.","category":"Shorts","default_price":"$10.00","features":[{"feature":"Lifetime Guarantee","value":"null"},{"feature":"Green Leaf Certified","value":"null"},{"feature":"5 Year Warranty","value":"null"}]}
```
- The response is accurate as far as I can tell so that's good.
- Command for the speed test:
`$ curl 127.0.0.1:3666/test/2001 -w "\n%{time_total}\n"`
- Response:
```
{"id":2000,"name":"Dorris Trousers","slogan":"Eum quo natus est necessitatibus ut aut quis.","description":"Nostrum beatae ut quidem fugiat doloremque. Voluptatem qui occaecati qui quo. Nostrum vitae praesentium perferendis consectetur consequatur dolores quas distinctio omnis. Ut et quia necessitatibus beatae voluptas delectus voluptatem. Ratione quod et aut maxime unde delectus.","category":"Trousers","default_price":"$466.00","features":[{"feature":"Lens","value":"Ultrasheen Gold"},{"feature":"Non-GMO","value":"null"}]}
0.316061
```
- The total time for the request is a blazing 0.31 seconds. Terrible.