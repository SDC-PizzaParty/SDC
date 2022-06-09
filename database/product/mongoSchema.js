/*
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
  features: Array
}

feature: {
  id: Number,
  product_id: Number,
  feature: String,
  value: String
}

style: {
  id: Number,
  product_id: Number,
  name: String,
  original_price: Number,
  sale_price: Number,
  default: Boolean,
  photos: Array,
  skus: Array,
}

photos: {
  id: Number,
  style_id: Number,
  url: String,
  thumbnail_url: String
}

skus: {
  id: Number,
  style_id: Number,
  quantity: Number,
  size: String
}

related_items: {
  id: Number,
  current_product_id: Number,
  related_product_id: Number
}
*/
