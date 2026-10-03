CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  image_alt TEXT,
  url TEXT NOT NULL,
  tags TEXT NOT NULL,
  own_work INTEGER NOT NULL DEFAULT 0,
  is_application INTEGER NOT NULL DEFAULT 0,
  sample_template INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
