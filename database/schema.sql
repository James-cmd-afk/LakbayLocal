-- ============================================================
-- LakbayLocal Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS lakbaylocal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lakbaylocal;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)                      NOT NULL,
  email         VARCHAR(150)                      NOT NULL UNIQUE,
  password_hash VARCHAR(255)                      NOT NULL,
  role          ENUM('traveler','contributor','admin') NOT NULL DEFAULT 'traveler',
  avatar_url    VARCHAR(500)                      NULL,
  bio           TEXT                              NULL,
  is_active     TINYINT(1)                        NOT NULL DEFAULT 1,
  created_at    TIMESTAMP                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP                         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80)  NOT NULL UNIQUE,
  icon       VARCHAR(80)  NULL COMMENT 'Ionicon / Expo icon name',
  color_hex  CHAR(7)      NULL COMMENT 'e.g. #2196F3',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO categories (name, icon, color_hex) VALUES
  ('Beach',             'water',            '#0EA5E9'),
  ('Waterfall',         'water-outline',    '#06B6D4'),
  ('Mountain',          'triangle',         '#84CC16'),
  ('Historical',        'business',         '#F59E0B'),
  ('Restaurant',        'restaurant',       '#EF4444'),
  ('Park & Nature',     'leaf',             '#22C55E'),
  ('Museum',            'library',          '#8B5CF6'),
  ('Adventure',         'bicycle',          '#F97316'),
  ('Cultural',          'people',           '#EC4899'),
  ('Accommodation',     'bed',              '#64748B');

-- ============================================================
-- 3. DESTINATIONS
-- ============================================================
CREATE TABLE destinations (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED                             NOT NULL,
  submitted_by    INT UNSIGNED                             NULL COMMENT 'user id of contributor',
  name            VARCHAR(200)                             NOT NULL,
  slug            VARCHAR(220)                             NOT NULL UNIQUE,
  description     TEXT                                     NULL,
  address         VARCHAR(300)                             NULL,
  city            VARCHAR(100)                             NULL,
  province        VARCHAR(100)                             NULL,
  latitude        DECIMAL(10,7)                            NULL,
  longitude       DECIMAL(10,7)                            NULL,
  entrance_fee    DECIMAL(10,2)                            NOT NULL DEFAULT 0.00,
  avg_food_cost   DECIMAL(10,2)                            NOT NULL DEFAULT 0.00 COMMENT 'average meal cost per person',
  avg_transport   DECIMAL(10,2)                            NOT NULL DEFAULT 0.00 COMMENT 'estimated transport cost',
  opening_time    TIME                                     NULL,
  closing_time    TIME                                     NULL,
  status          ENUM('pending','approved','rejected')    NOT NULL DEFAULT 'pending',
  featured        TINYINT(1)                               NOT NULL DEFAULT 0,
  avg_rating      DECIMAL(3,2)                             NOT NULL DEFAULT 0.00,
  review_count    INT UNSIGNED                             NOT NULL DEFAULT 0,
  cover_image_url VARCHAR(500)                             NULL,
  approved_at     TIMESTAMP                                NULL,
  approved_by     INT UNSIGNED                             NULL,
  created_at      TIMESTAMP                                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP                                NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dest_category  FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_dest_submitted FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_dest_approved  FOREIGN KEY (approved_by)  REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 4. DESTINATION IMAGES
-- ============================================================
CREATE TABLE destination_images (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destination_id INT UNSIGNED   NOT NULL,
  image_url      VARCHAR(500)   NOT NULL,
  caption        VARCHAR(200)   NULL,
  sort_order     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  uploaded_by    INT UNSIGNED   NULL,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_img_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  CONSTRAINT fk_img_uploader    FOREIGN KEY (uploaded_by)    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 5. FAVORITES
-- ============================================================
CREATE TABLE favorites (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NOT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorite (user_id, destination_id),
  CONSTRAINT fk_fav_user        FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. ITINERARIES
-- ============================================================
CREATE TABLE itineraries (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED    NOT NULL,
  title       VARCHAR(200)    NOT NULL,
  description TEXT            NULL,
  start_date  DATE            NULL,
  end_date    DATE            NULL,
  budget      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  num_days    TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status      ENUM('draft','active','completed') NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_itin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. ITINERARY ITEMS
-- ============================================================
CREATE TABLE itinerary_items (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  itinerary_id   INT UNSIGNED    NOT NULL,
  destination_id INT UNSIGNED    NOT NULL,
  day_number     TINYINT UNSIGNED NOT NULL DEFAULT 1,
  visit_order    TINYINT UNSIGNED NOT NULL DEFAULT 1,
  visit_date     DATE            NULL,
  arrival_time   TIME            NULL,
  duration_mins  SMALLINT UNSIGNED NULL COMMENT 'planned stay in minutes',
  notes          TEXT            NULL,
  transport_cost DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  meal_cost      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_item_itinerary   FOREIGN KEY (itinerary_id)   REFERENCES itineraries(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_destination FOREIGN KEY (destination_id) REFERENCES destinations(id)
) ENGINE=InnoDB;

-- ============================================================
-- 8. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NOT NULL,
  rating         TINYINT UNSIGNED NOT NULL COMMENT '1 to 5',
  title          VARCHAR(150) NULL,
  body           TEXT         NULL,
  is_visible     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review (user_id, destination_id),
  CONSTRAINT fk_rev_user        FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES FOR QUERY PERFORMANCE
-- ============================================================
CREATE INDEX idx_dest_status   ON destinations(status);
CREATE INDEX idx_dest_category ON destinations(category_id);
CREATE INDEX idx_dest_featured ON destinations(featured);
CREATE INDEX idx_dest_city     ON destinations(city);
CREATE INDEX idx_dest_province ON destinations(province);
CREATE INDEX idx_itin_user     ON itineraries(user_id);
CREATE INDEX idx_item_itin     ON itinerary_items(itinerary_id);
CREATE INDEX idx_rev_dest      ON reviews(destination_id);

-- ============================================================
-- SEED DATA – Sample Destinations (Philippines)
-- ============================================================
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin LakbayLocal', 'admin@lakbaylocal.com',
   '$2b$10$examplehashplaceholder1234567890', 'admin');

INSERT INTO destinations (category_id, submitted_by, name, slug, description,
  city, province, entrance_fee, avg_food_cost, avg_transport,
  opening_time, closing_time, status, featured, cover_image_url, approved_by, approved_at)
VALUES
  (1, NULL, 'Boracay White Beach', 'boracay-white-beach',
   'World-famous 4 km stretch of powdery white sand and crystal-clear turquoise waters.',
   'Malay', 'Aklan', 100.00, 350.00, 200.00, '06:00:00','20:00:00','approved',1,
   'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800', 1, NOW()),

  (2, NULL, 'Tappiyah Falls', 'tappiyah-falls',
   'A stunning 30-meter waterfall hidden deep in the Cordillera mountains near Batad.',
   'Banaue', 'Ifugao', 50.00, 200.00, 150.00, '07:00:00','16:00:00','approved',1,
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 1, NOW()),

  (3, NULL, 'Mount Pulag National Park', 'mount-pulag',
   'The highest peak in Luzon at 2,922 m, known for its spectacular sea of clouds at sunrise.',
   'Kabayan', 'Benguet', 200.00, 300.00, 400.00, '04:00:00','14:00:00','approved',1,
   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', 1, NOW()),

  (4, NULL, 'Intramuros', 'intramuros-manila',
   'The historic walled city of Manila, a living museum of Spanish colonial history.',
   'Manila', 'Metro Manila', 75.00, 250.00, 80.00, '08:00:00','18:00:00','approved',1,
   'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800', 1, NOW()),

  (1, NULL, 'Nacpan Beach', 'nacpan-beach-palawan',
   'Twin beaches spanning 4 km of fine golden sand, considered one of the best in the Philippines.',
   'El Nido', 'Palawan', 0.00, 280.00, 300.00, '06:00:00','18:00:00','approved',1,
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 1, NOW()),

  (6, NULL, 'Chocolate Hills', 'chocolate-hills-bohol',
   'Over 1,700 conical limestone hills that turn chocolate brown during dry season.',
   'Carmen', 'Bohol', 50.00, 200.00, 250.00, '06:00:00','18:00:00','approved',1,
   'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800', 1, NOW());
