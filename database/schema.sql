-- SARDO Café Database Schema

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, preparing, ready, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Order Items Table (for detailed tracking)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL
);

-- Insert initial menu items
INSERT INTO menu_items (name, price, category, description) VALUES
('Macchiato', 120, 'Coffee', 'Espresso with a touch of steamed milk'),
('Coffee', 90, 'Coffee', 'Strong black coffee'),
('Latte', 120, 'Coffee', 'Espresso with steamed milk'),
('Ice Latte', 350, 'Coffee', 'Cold refreshing latte')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
