<<<<<<< HEAD
-- DROP TABLE IF EXISTS trip CASCADE;

-- CREATE TABLE trip (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   destination VARCHAR(255),
--   start_date DATE,
--   end_date DATE,
--   vibe VARCHAR(255),
--   cover_photo TEXT,
--   notes TEXT
-- );

-- INSERT INTO trip (name, destination, start_date, end_date, notes)
-- VALUES
--   ('Amsterdam Adventure', 'Amsterdam, Netherlands', '2025-08-30', '2025-09-03', 'Canals, Coffee Shops, Bicyles, and Art Museums'),
--   ('Rome Getaway', 'Rome, Italy', '2025-09-12', '2025-09-16', 'Visit Colosseum, Vatican City, Eat Lots of Pasta, Live La Dolce Vita'),
--   ('Dublin Visit', 'Dublin, Ireland', '2025-09-16', '2025-09-20', 'Pubs, Castles, and Parks'),
--   ('Tokyo Trip', 'Tokyo, Japan', '2025-09-20', '2025-09-25', 'Sushi, Temples, and Shopping'),
--   ('Sydney Sojourn', 'Sydney, Australia', '2025-09-25', '2025-09-30', 'Beaches, Opera House, and Wildlife');

-- CREATE TABLE day (
--   id SERIAL PRIMARY KEY,
--   trip_id INT REFERENCES trip(id) ON DELETE CASCADE,
--   date DATE,
--   notes TEXT,
--   image_url TEXT
-- );

-- CREATE TABLE place (
--   id SERIAL PRIMARY KEY,
--   day_id INT REFERENCES day(id) ON DELETE CASCADE,
--   name VARCHAR(255),
--   lat FLOAT,
--   lng FLOAT
-- );

-- CREATE TABLE photo (
--   id SERIAL PRIMARY KEY,
--   trip_id INT REFERENCES trip(id) ON DELETE CASCADE,
--   day_id INT REFERENCES day(id) ON DELETE CASCADE,
--   uploaded_by INT,
--   image_url VARCHAR,
--   caption VARCHAR
-- );
=======
DROP TABLE IF EXISTS trip CASCADE;
CREATE TABLE trip (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  destination VARCHAR(255),
  start_date DATE,
  end_date DATE,
  vibe VARCHAR(255),
  cover_photo TEXT,
  notes TEXT
);
INSERT INTO trip (name, destination, start_date, end_date, notes)
VALUES
  ('Amsterdam Adventure', 'Amsterdam, Netherlands', '2025-08-30', '2025-09-03', 'Canals, Coffee Shops, Bicyles, and Art Museums'),
  ('Rome Getaway', 'Rome, Italy', '2025-09-12', '2025-09-16', 'Visit Colosseum, Vatican City, Eat Lots of Pasta, Live La Dolce Vita'),
  ('Dublin Visit', 'Dublin, Ireland', '2025-09-16', '2025-09-20', 'Pubs, Castles, and Parks'),
  ('Tokyo Trip', 'Tokyo, Japan', '2025-09-20', '2025-09-25', 'Sushi, Temples, and Shopping'),
  ('Sydney Sojourn', 'Sydney, Australia', '2025-09-25', '2025-09-30', 'Beaches, Opera House, and Wildlife');
CREATE TABLE day (
  id SERIAL PRIMARY KEY,
  trip_id INT REFERENCES trip(id) ON DELETE CASCADE,
  date DATE,
  notes TEXT,
  image_url TEXT
);
CREATE TABLE place (
  id SERIAL PRIMARY KEY,
  day_id INT REFERENCES day(id) ON DELETE CASCADE,
  name VARCHAR(255),
  lat FLOAT,
  lng FLOAT
);
CREATE TABLE photo (
  id SERIAL PRIMARY KEY,
  trip_id INT REFERENCES trip(id) ON DELETE CASCADE,
  day_id INT REFERENCES day(id) ON DELETE CASCADE,
  uploaded_by INT,
  image_url VARCHAR,
  caption VARCHAR
);
>>>>>>> e858781149cfc82a2f9409978fc5cf20358fbc4c
