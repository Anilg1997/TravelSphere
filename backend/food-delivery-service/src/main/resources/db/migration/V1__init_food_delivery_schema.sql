-- Create food delivery schema
CREATE SCHEMA IF NOT EXISTS food_schema;

-- Restaurants table
CREATE TABLE food_schema.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine VARCHAR(100) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    phone_number VARCHAR(20),
    image_url TEXT,
    avg_delivery_time_minutes INTEGER DEFAULT 30,
    rating DECIMAL(3, 1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE food_schema.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES food_schema.restaurants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(8, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    spice_level VARCHAR(20),
    prep_time_minutes DECIMAL(5, 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food orders table
CREATE TABLE food_schema.food_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_ref VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID,
    restaurant_id UUID NOT NULL REFERENCES food_schema.restaurants(id),
    restaurant_name VARCHAR(255),
    delivery_address TEXT NOT NULL,
    delivery_latitude DECIMAL(10, 7),
    delivery_longitude DECIMAL(10, 7),
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLACED',
    special_instructions TEXT,
    estimated_delivery_time TIMESTAMP,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    payment_method VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE food_schema.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES food_schema.food_orders(id),
    menu_item_id UUID NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(8, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT
);

-- Indexes
CREATE INDEX idx_menu_items_restaurant ON food_schema.menu_items(restaurant_id);
CREATE INDEX idx_food_orders_user ON food_schema.food_orders(user_id);
CREATE INDEX idx_food_orders_restaurant ON food_schema.food_orders(restaurant_id);
CREATE INDEX idx_food_orders_status ON food_schema.food_orders(status);
CREATE INDEX idx_food_orders_ref ON food_schema.food_orders(order_ref);
CREATE INDEX idx_order_items_order ON food_schema.order_items(order_id);
CREATE INDEX idx_restaurants_city ON food_schema.restaurants(city);
CREATE INDEX idx_restaurants_cuisine ON food_schema.restaurants(cuisine);

-- Seed sample restaurants
INSERT INTO food_schema.restaurants (name, description, cuisine, address, city, country, phone_number, avg_delivery_time_minutes, rating, review_count, min_order_amount, delivery_fee, tags) VALUES
('Spice Garden', 'Authentic Indian cuisine with a modern twist', 'Indian', '12 MG Road', 'Mumbai', 'India', '+91-22-12345678', 35, 4.5, 230, 200.00, 30.00, ARRAY['vegetarian-friendly', 'family', 'spicy']),
('Bella Napoli', 'Traditional Italian pizza and pasta', 'Italian', '45 Marine Drive', 'Mumbai', 'India', '+91-22-87654321', 40, 4.3, 180, 250.00, 40.00, ARRAY['pizza', 'pasta', 'date-night']),
('Dragon Palace', 'Szechuan and Cantonese delicacies', 'Chinese', '78 Linking Road', 'Mumbai', 'India', '+91-22-11223344', 30, 4.6, 310, 150.00, 25.00, ARRAY['noodles', 'dim-sum', 'quick-delivery']),
('Tokyo Bento', 'Japanese sushi, ramen, and bento boxes', 'Japanese', '90 Bandra West', 'Mumbai', 'India', '+91-22-55667788', 45, 4.7, 280, 300.00, 50.00, ARRAY['sushi', 'ramen', 'premium']),
('Taco Fiesta', 'Fresh Mexican street food and burritos', 'Mexican', '23 Andheri East', 'Mumbai', 'India', '+91-22-99887766', 25, 4.2, 150, 100.00, 20.00, ARRAY['burritos', 'tacos', 'budget-friendly']),
('Bangkok Street', 'Authentic Thai curries and pad thai', 'Thai', '56 Juhu Beach Road', 'Mumbai', 'India', '+91-22-44332211', 35, 4.4, 195, 180.00, 35.00, ARRAY['curry', 'pad-thai', 'spicy']),
('The Burger Lab', 'Gourmet burgers and loaded fries', 'American', '89 Powai Lake', 'Mumbai', 'India', '+91-22-66778899', 20, 4.1, 260, 120.00, 15.00, ARRAY['burgers', 'fries', 'fast-food']),
('Olive Garden', 'Fresh Mediterranean salads and kebabs', 'Mediterranean', '34 Colaba Causeway', 'Mumbai', 'India', '+91-22-33445566', 38, 4.5, 170, 220.00, 30.00, ARRAY['healthy', 'kebabs', 'salads']),
('Curry House Delhi', 'North Indian specialties and biryanis', 'Indian', '67 Connaught Place', 'Delhi', 'India', '+91-11-12345678', 40, 4.6, 340, 200.00, 25.00, ARRAY['biryani', 'north-indian', 'family']),
('Pizza Roma Delhi', 'Wood-fired pizzas and Italian classics', 'Italian', '89 Khan Market', 'Delhi', 'India', '+91-11-87654321', 35, 4.4, 210, 280.00, 35.00, ARRAY['wood-fired', 'pizza', 'italian']);

-- Seed sample menu items for Spice Garden (Mumbai)
INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Butter Chicken', 'Creamy tomato-based chicken curry', 'Main Course', 320.00, true, false, false, true, 'medium', 20
FROM food_schema.restaurants r WHERE r.name = 'Spice Garden';

INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Paneer Tikka', 'Grilled cottage cheese with spices', 'Starters', 250.00, true, true, false, true, 'medium', 15
FROM food_schema.restaurants r WHERE r.name = 'Spice Garden';

INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Garlic Naan', 'Freshly baked naan with garlic butter', 'Breads', 60.00, true, true, false, false, 'mild', 10
FROM food_schema.restaurants r WHERE r.name = 'Spice Garden';

INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Biryani Special', 'Fragrant rice layered with spiced chicken', 'Main Course', 350.00, true, false, false, true, 'spicy', 25
FROM food_schema.restaurants r WHERE r.name = 'Spice Garden';

INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Mango Lassi', 'Sweet yogurt drink with mango', 'Beverages', 80.00, true, true, false, true, 'mild', 5
FROM food_schema.restaurants r WHERE r.name = 'Spice Garden';

-- Seed menu items for Bella Napoli
INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Margherita Pizza', 'Classic tomato, mozzarella, and basil', 'Pizza', 280.00, true, true, false, false, 'mild', 15
FROM food_schema.restaurants r WHERE r.name = 'Bella Napoli';

INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Penne Arrabiata', 'Spicy tomato sauce penne pasta', 'Pasta', 220.00, true, true, false, false, 'spicy', 12
FROM food_schema.restaurants r WHERE r.name = 'Bella Napoli';

INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Tiramisu', 'Classic Italian coffee-flavored dessert', 'Desserts', 180.00, true, true, false, false, 'mild', 5
FROM food_schema.restaurants r WHERE r.name = 'Bella Napoli';

-- Seed menu items for Dragon Palace
INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Kung Pao Chicken', 'Spicy stir-fried chicken with peanuts', 'Main Course', 280.00, true, false, false, true, 'spicy', 15
FROM food_schema.restaurants r WHERE r.name = 'Dragon Palace';

INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Spring Rolls', 'Crispy vegetable spring rolls', 'Starters', 150.00, true, true, false, false, 'mild', 10
FROM food_schema.restaurants r WHERE r.name = 'Dragon Palace';

INSERT INTO food_schema.menu_items (restaurant_id, name, description, category, price, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, prep_time_minutes)
SELECT r.id, 'Fried Rice', 'Wok-fried rice with vegetables', 'Rice & Noodles', 180.00, true, true, true, true, 'mild', 10
FROM food_schema.restaurants r WHERE r.name = 'Dragon Palace';
