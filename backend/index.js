const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/sardo_cafe'
});

// Routes

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY category, name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Add new menu item
app.post('/api/menu', async (req, res) => {
  try {
    const { name, price, category, description, image_url } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO menu_items (name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, category, description || null, image_url || null]
    );
    
    io.emit('menu-updated');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Update menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, image_url } = req.body;

    const result = await pool.query(
      'UPDATE menu_items SET name=$1, price=$2, category=$3, description=$4, image_url=$5 WHERE id=$6 RETURNING *',
      [name, price, category, description, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    io.emit('menu-updated');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM menu_items WHERE id=$1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    io.emit('menu-updated');
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Place new order
app.post('/api/orders', async (req, res) => {
  try {
    const { table_number, items, total_price } = req.body;

    if (!table_number || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const result = await pool.query(
      'INSERT INTO orders (table_number, items, total_price, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [table_number, JSON.stringify(items), total_price, 'pending']
    );

    io.emit('new-order', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    io.emit('order-updated', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'SARDO Café API is running! 🎬☕' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SARDO Café API running on port ${PORT}`);
});
