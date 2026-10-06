ALTER TABLE categories
  ADD UNIQUE KEY uq_categories_id_business (id, business_id);

ALTER TABLE products
  DROP FOREIGN KEY fk_products_category;

ALTER TABLE products
  ADD CONSTRAINT fk_products_category
    FOREIGN KEY (category_id, business_id) REFERENCES categories (id, business_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;
