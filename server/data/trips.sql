DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS journals;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS days;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS accounts;

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    session_token TEXT UNIQUE,
    session_expires_at TIMESTAMP
);


CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    account_id int REFERENCES accounts(id),
    title VARCHAR NOT NULL,
    destination VARCHAR NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    vibe TEXT,
    cover_photo VARCHAR
);

CREATE TABLE days (
    id SERIAL PRIMARY KEY,
    trip_id int REFERENCES trips(id),
    day DATE NOT NULL,
    image_url VARCHAR,
    plan TEXT,
    highlight BOOLEAN DEFAULT FALSE,
    tags TEXT[]
);

CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    day_id int REFERENCES days(id),
    name VARCHAR,
    type VARCHAR,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL
);

CREATE TABLE journals (
    id SERIAL PRIMARY KEY,
    day_id int REFERENCES days(id),
    image_url VARCHAR,
    note TEXT NOT NULL,
    time TIMESTAMP,
    highlight BOOLEAN DEFAULT FALSE,
    tags TEXT[]
);

CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    day_id INT REFERENCES days(id),
    image_url TEXT NOT NULL
);

INSERT INTO accounts (name, email, hashed_password)
VALUES
    ('bob', 'bob@email.com', '$2b$12$W7bE7obZRr/OPC6BcijR6OmDmYibJLxXRX4JqKzPK5sLj92Hd2ZA2'),
    ('admin', 'admin@dev.com', '$2b$12$240eLIQqLhdMtSfhpQro2ON0LbCj9DiQSRyDzcU9NcGRrHXdeGrkS');
-- passwords are:
-- bob: bobbers
-- admin: admin


INSERT INTO trips (account_id, title, destination, start_date, end_date, vibe, cover_photo) VALUES
(1, 'Lisbon Wander', 'Lisbon', '2024-06-01', '2024-06-03', 'sunny + coffee', 'https://images.unsplash.com/photo-1599069158346-684fee0e414a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 3 days
(2, 'Snowy Peaks', 'Zermatt', '2025-01-05', '2025-01-11', 'mountains + fondue', 'https://plus.unsplash.com/premium_photo-1673254928968-b6513f32d43b?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 7 days
(1, 'Tokyo Lights', 'Tokyo', '2024-11-01', '2024-11-03', 'neon + tech', 'https://images.unsplash.com/photo-1551322120-c697cf88fbdc?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 3 days
(2, 'Paris Escape', 'Paris', '2025-04-01', '2025-04-02', 'romantic + art', 'https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 2 days
(1, 'Bali Peace', 'Bali', '2024-09-10', '2024-09-15', 'yoga + sea', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 5 days
(2, 'Patagonia Trek', 'El Chaltén', '2023-12-10', '2023-12-16', 'wild + hiking', 'https://plus.unsplash.com/premium_photo-1694475710456-682ba042cb7b?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 7 days
(1, 'NY Foodie Run', 'NYC', '2024-08-15', '2024-08-17', 'food + pace', 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 3 days
(2, 'Floripa Surf', 'Florianópolis', '2024-12-01', '2024-12-03', 'surf + chill', 'https://images.unsplash.com/photo-1559778989-e92bd0ecfd34?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 3 days
(1, 'Desert Drive', 'Arizona', '2024-10-01', '2024-10-03', 'desert + road', 'https://plus.unsplash.com/premium_photo-1661925249607-9262896b6a69?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'), -- 3 days
(1, 'Banff Blues', 'Banff', '2024-07-01', '2024-07-05', 'trails + lakes', 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2011&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'); -- 5 days

INSERT INTO days (trip_id, day, image_url, plan) VALUES
(1, '2024-06-01', 'lisbon_day1.jpg', 'Arrive in Lisbon, explore Baixa and Praça do Comércio.'),
(1, '2024-06-02', 'lisbon_day2.jpg', 'Tram 28 ride through Alfama, Fado dinner at night.'),
(1, '2024-06-03', 'lisbon_day3.jpg', 'Visit Belém Tower and Jerónimos Monastery.'),

(2, '2025-01-05', 'zermatt_day1.jpg', 'Check into ski lodge, relax with fondue.'),
(2, '2025-01-06', 'zermatt_day2.jpg', 'Morning slopes and evening spa.'),
(2, '2025-01-07', 'zermatt_day3.jpg', 'Explore town, buy souvenirs, scenic views.'),

(3, '2024-11-01', 'tokyo_day1.jpg', 'Shibuya crossing and night sushi.'),
(3, '2024-11-02', 'tokyo_day2.jpg', 'Akihabara tech crawl and manga shops.'),

(4, '2025-04-01', 'paris_day1.jpg', 'Stroll along the Seine and visit the Louvre.'),
(4, '2025-04-02', 'paris_day2.jpg', 'Breakfast near Eiffel Tower, Montmartre art walk.'),

(5, '2024-09-10', 'bali_day1.jpg', 'Sunrise yoga and beachfront breakfast.'),
(5, '2024-09-11', 'bali_day2.jpg', 'Temple visit and beach chill.'),

(6, '2023-12-10', 'patagonia_day1.jpg', 'Trailhead warm-up and gear prep.'),
(6, '2023-12-11', 'patagonia_day2.jpg', 'Start Fitz Roy hike, lakeside picnic.'),

(7, '2024-08-15', 'nyc_day1.jpg', 'Bagels, Broadway, and Bryant Park.'),
(7, '2024-08-16', 'nyc_day2.jpg', 'Museum hopping and late-night slice.'),

(8, '2024-12-01', 'floripa_day1.jpg', 'Surf lesson and beach stroll.'),
(8, '2024-12-02', 'floripa_day2.jpg', 'Hike to overlook and seafood dinner.'),

(9, '2024-10-01', 'arizona_day1.jpg', 'Desert drive and stargazing in Sedona.'),

(10, '2024-07-01', 'banff_day1.jpg', 'Check-in and lakeside walk.'),
(10, '2024-07-02', 'banff_day2.jpg', 'Canoeing and mountain picnic.');


INSERT INTO places (day_id, name, type, lat, lng) VALUES
(1, 'Praça do Comércio', 'landmark', 38.7071, -9.1355),
(2, 'Alfama', 'neighborhood', 38.7139, -9.1255),
(4, 'Matterhorn View', 'viewpoint', 46.0190, 7.7459),
(5, 'Zermatt Village', 'town', 46.0207, 7.7491),
(7, 'Shibuya Crossing', 'landmark', 35.6595, 139.7004),
(9, 'Eiffel Tower', 'landmark', 48.8584, 2.2945),
(11, 'Uluwatu Temple', 'temple', -8.8296, 115.0870),
(13, 'Fitz Roy Trail', 'trail', -49.2778, -72.9830),
(15, 'Central Park', 'park', 40.7851, -73.9683),
(18, 'Praia Mole', 'beach', -27.5949, -48.4170);


INSERT INTO journals (day_id, image_url, note, time) VALUES
(1, 'journal1.jpg', 'Sunny day in Lisbon, lots of tiles and pasteis de nata.', '2024-06-01'),
(4, 'journal2.jpg', 'Mountains feel infinite. Took the cable car early morning.', '2025-01-05'),
(7, 'journal3.jpg', 'Tokyo is buzzing — street food and vending machines everywhere.', '2024-11-01'),
(11, 'journal4.jpg', 'Meditated by the sea at Uluwatu Temple. Peaceful.', '2024-09-10'),
(15, 'journal5.jpg', 'Walked through NYC, bagel in hand. Fast-paced and fun.', '2024-08-15');
