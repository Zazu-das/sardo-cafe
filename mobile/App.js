import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('1');
  const [selectedTable, setSelectedTable] = useState('1');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      Alert.alert('Error', 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Order', 'Please add items to your order');
      return;
    }

    try {
      const orderData = {
        table_number: parseInt(selectedTable),
        items: cart,
        total_price: calculateTotal(),
      };

      await axios.post(`${API_URL}/api/orders`, orderData);
      Alert.alert('Success', 'Order placed! Our team will prepare it soon.');
      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>Loading Menu...</Text>
      </View>
    );
  }

  const categories = [...new Set(menuItems.map((item) => item.category))];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎬 SARDO 🎬</Text>
        <Text style={styles.subtitle}>Digital Menu</Text>
      </View>

      {/* Table Selection */}
      <View style={styles.tableSelector}>
        <Text style={styles.label}>Select Table:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tableList}
        >
          {Array.from({ length: 19 }, (_, i) => (i + 1).toString()).map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.tableButton,
                selectedTable === num && styles.tableButtonSelected,
              ]}
              onPress={() => setSelectedTable(num)}
            >
              <Text
                style={[
                  styles.tableButtonText,
                  selectedTable === num && styles.tableButtonTextSelected,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <View key={item.id} style={styles.menuItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    )}
                    <Text style={styles.itemPrice}>{item.price} Birr</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addToCart(item)}
                  >
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        ))}
      </ScrollView>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>🛒 Your Order</Text>
            <Text style={styles.cartCount}>{cart.length} items</Text>
          </View>

          <ScrollView style={styles.cartItems}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>
                    {item.price} × {item.quantity} = {item.price * item.quantity} Birr
                  </Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.cartFooter}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>{calculateTotal()} Birr</Text>
            </View>
            <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#d4af37',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 2,
    borderBottomColor: '#d4af37',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d4af37',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#b0b0b0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tableSelector: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  label: {
    color: '#d4af37',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  tableList: {
    flexDirection: 'row',
  },
  tableButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 6,
    backgroundColor: '#252525',
  },
  tableButtonSelected: {
    backgroundColor: '#d4af37',
    borderColor: '#d4af37',
  },
  tableButtonText: {
    color: '#b0b0b0',
    fontSize: 12,
    fontWeight: '500',
  },
  tableButtonTextSelected: {
    color: '#0f0f0f',
    fontWeight: '700',
  },
  menuContainer: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 3,
    borderLeftColor: '#d4af37',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#b0b0b0',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#0f0f0f',
    fontWeight: 'bold',
  },
  cartSection: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#d4af37',
    maxHeight: 300,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d4af37',
  },
  cartCount: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  cartItems: {
    maxHeight: 120,
    paddingHorizontal: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 13,
    color: '#f5f5f5',
    fontWeight: '500',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  quantityButtonText: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityText: {
    color: '#f5f5f5',
    fontSize: 13,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  cartFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  placeOrderButton: {
    backgroundColor: '#d4af37',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#0f0f0f',
    fontSize: 14,
    fontWeight: '700',
  },
});
