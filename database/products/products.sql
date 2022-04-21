DROP TABLE IF EXISTS product;

CREATE TABLE IF NOT EXISTS product (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(80),
  slogan          TEXT,
  description     TEXT,
  category        VARCHAR(80),
  default_price   MONEY,
);

DROP TABLE IF EXISTS features;

CREATE TABLE IF NOT EXISTS features (
  id              SERIAL PRIMARY KEY,
  product_id      INTEGER NOT NULL,
  feature         VARCHAR(80),
  value           TEXT,
  FOREIGN KEY (product_id) REFERENCES product
);

DROP TABLE IF EXISTS styles;

CREATE TABLE IF NOT EXISTS styles (
  id                SERIAL PRIMARY KEY,
  product_id        INTEGER NOT NULL,
  name              VARCHAR(256),
  sale_price        MONEY,
  original_price    MONEY,
  default_style     BOOLEAN,
  FOREIGN KEY (product_id) REFERENCES product
)

DROP TABLE IF EXISTS photos;

CREATE TABLE IF NOT EXISTS photos (
  id              SERIAL PRIMARY KEY,
  style_id        INTEGER,
  url             TEXT,
  thumbnail_url   TEXT,
  FOREIGN KEY (style_id) REFERENCES styles
)

DROP TABLE IF EXISTS skus;

CREATE TABLE IF NOT EXISTS skus (
  id          SERIAL PRIMARY KEY,
  style_id    INTEGER NOT NULL,
  size        VARCHAR(128),
  quantity    INTEGER,
  FOREIGN KEY (style_id) REFERENCES styles
)

DROP TABLE IF EXISTS related;

CREATE TABLE IF NOT EXISTS related (
  id            SERIAL PRIMARY KEY,
  product_id    INTEGER
)