INSERT INTO templates (name, slug, description, preview_image, status)
VALUES
  ('Modern Business', 'modern-business', 'A clean, flexible layout for local, professional and service businesses.', NULL, 'ACTIVE'),
  ('Food / Bakery', 'food-bakery', 'A warm, product-led layout for bakeries, cafes and food businesses.', NULL, 'ACTIVE'),
  ('Salon & Wellness', 'salon-studio', 'A calm, editorial layout for salons, spas and wellness studios.', NULL, 'ACTIVE'),
  ('Jewellery Boutique', 'jewellery-boutique', 'A refined, dark editorial layout for jewellery and premium boutiques.', NULL, 'ACTIVE')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);
