COPY product FROM 'database/seed_data/product.csv'
  WITH CSV HEADER;

COPY features FROM 'database/seed_data/features.csv'
  WITH CSV HEADER;

COPY styles FROM 'database/seed_data/styles.csv'
  WITH CSV HEADER NULL 'null';

COPY product FROM 'database/seed_data/skus.csv'
  WITH CSV HEADER;

COPY related FROM 'database/seed_data/related.csv'
  WITH CSV HEADER;