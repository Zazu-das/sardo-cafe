import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Coffee',
    description: ''
  });

  // Connect to WebSocket
  useEffect(() => {
    const socket = io(API_URL);

    socket.on('new-order', (order) => {
      setOrders((prev) => [order, ...prev]);
      playNotificationSound();
    });

    socket.on('order-updated', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });

    socket.on('menu-updated', () => {
      fetchMenu();
    });

    return () => socket.disconnect();
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/menu`, newItem);
      setNewItem({ name: '', price: '', category: 'Coffee', description: '' });
      setShowMenuEditor(false);
      fetchMenu();
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Failed to add menu item');
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/api/menu/${itemId}`);
        fetchMenu();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const playNotificationSound = () => {
    // Simple beep sound for new orders
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#d4af37';
      case 'preparing': return '#ff6b6b';
      case 'ready': return '#4ecdc4';
      case 'completed': return '#95e1d3';
      default: return '#666';
    }
  };

  return (
    <div className="app-container">
      <header className="vintage-header">
        <h1>🎬 SARDO CAFÉ 🎬</h1>
        <p className="subtitle">Staff Dashboard - Order Management</p>
      </header>

      <div className="dashboard-grid">
        {/* Orders Section */}
        <section className="orders-section">
          <h2>📋 Active Orders</h2>
          <div className="orders-list">
            {orders.filter(o => o.status !== 'completed').map((order) => (
              <div key={order.id} className="order-card" style={{ borderLeftColor: getStatusColor(order.status) }}>
                <div className="order-header">
                  <span className="table-number">Table {order.table_number}</span>
                  <span className="order-time">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <div className="order-items">
                  {JSON.parse(order.items).map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="price">{item.price * item.quantity} Birr</span>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  Total: <strong>{order.total_price} Birr</strong>
                </div>

                <div className="order-controls">
                  <select 
                    value={order.status} 
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">🕐 Pending</option>
                    <option value="preparing">👨‍🍳 Preparing</option>
                    <option value="ready">✅ Ready</option>
                    <option value="completed">🎉 Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Menu Management Section */}
        <section className="menu-section">
          <div className="menu-header">
            <h2>☕ Menu Management</h2>
            <button 
              className="add-btn"
              onClick={() => setShowMenuEditor(!showMenuEditor)}
            >
              {showMenuEditor ? '✕ Close' : '+ Add Item'}
            </button>
          </div>

          {showMenuEditor && (
            <form className="menu-form" onSubmit={addMenuItem}>
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price (Birr)"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                required
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="Coffee">☕ Coffee</option>
                <option value="Beverages">🥤 Beverages</option>
                <option value="Pastries">🥐 Pastries</option>
                <option value="Desserts">🍰 Desserts</option>
                <option value="Meals">🍽️ Meals</option>
              </select>
              <input
                type="text"
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
              <button type="submit" className="submit-btn">Add to Menu</button>
            </form>
          )}

          <div className="menu-list">
            {menuItems.map((item) => (
              <div key={item.id} className="menu-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="category">{item.category}</p>
                  {item.description && <p className="description">{item.description}</p>}
                </div>
                <div className="item-actions">
                  <span className="price">{item.price} Birr</span>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteMenuItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
