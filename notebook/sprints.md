# SPRINTS
- [x] Complete getting started guide for pg module
  - There might be some knowledge I can glean from the setup that will be helpful to me when I begin to formulate my queries

- [x] Structure a query so that I can make one lookup onto my db and get back the data I need in order to form the following structure:
```
product: {
  id: Number,
  campus: String,
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: Number,
  created_at: Date,
  updated_at: Date,
  features: Array // -> Result of query for features
}
```

- [ ] Structure a query so I can make one look up for the styles of a product ID. Styles should be returned in the following structure:
```
{
  "product_id": "1",
  "results": [
    {
      "style_id": 1,
      "photos": [{url: ''},...],
      "skus": {id: {},.. .},
    }, //...]
}
```

- [ ] Setup the skus query to format the result as an object with keys being the sku id


## Normalize the 'category' column of product into a category id and table of categories
- Doing so will enable me to change the names of categories. i.e. shoes -> kicks.
- Can I run a query on the product table that does something like this:
  - Take the unique values of the category column and put them into another table, with an index that auto increments

