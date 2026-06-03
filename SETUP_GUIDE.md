# SARDO Café - Setup & Installation Guide

## 🎬 Welcome to SARDO Café!

This is your complete digital menu and ordering system with a vintage cinema theme.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SARDO CAFÉ SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │ CUSTOMER (iOS)   │        │  STAFF DASHBOARD (Web)   │  │
│  │ & Android        │──────▶ │  Windows Compatible      │  │
│  │                  │        │                          │  │
│  │ • Menu Browse    │        │ • Order Management       │  │
│  │ • Add to Cart    │◀────── │ • Menu Editor            │  │
│  │ • Place Order    │        │ • Status Updates         │  │
│  └──────────────────┘        └──────────────────────────┘  │
│           │                             │                    │
│           └──────────┬──────────────────┘                    │
│                      ▼                                        │
│          ┌─────────────────────────┐                        │
│          │   Node.js API Server    │                        │
│          │     (Backend)           │                        │
│          └────────┬────────────────┘                        │
│                   │                                          │
│                   ▼                                          │
│           ┌───────────────────────┐                        │
│           │   PostgreSQL Database │                        │
│           │  • Menu Items         │                        │
│           │  • Orders             │                        │
│           │  • Order Items        │                        │
│           └───────────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **PostgreSQL** ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

## 📁 Project Structure

```
sardo-cafe/
├── backend/               # Node.js API server
│   ├── index.js          # Main server file
│   ├── package.json      # Dependencies
│   └── .env              # Environment variables
├── database/             # Database setup
│   └── schema.sql        # Database schema
├── dashboard/            # Staff dashboard (React)
│   ├── src/
│   │   ├── App.jsx       # Main component
│   │   ├── App.css       # Styling
│   │   └── index.js      # Entry point
│   └── package.json      # Dependencies
├── mobile/               # Mobile app (React Native)
│   ├── App.js            # Main app component
│   └── app.json          # App config
└── README.md             # This file
```

---

## 🚀 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/Zazu-das/sardo-cafe.git
cd sardo-cafe
```

### Step 2: Set Up PostgreSQL Database

#### Option A: Using PostgreSQL Command Line

```bash
# Create database
createdb sardo_cafe

# Connect and run schema
psql sardo_cafe < database/schema.sql
```

#### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Create a new database: `sardo_cafe`
3. Open query editor and paste contents of `database/schema.sql`
4. Execute the query

---

### Step 3: Set Up Backend API

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/sardo_cafe
```

**Start the backend server:**

```bash
npm run dev
```

Expected output:
```
SARDO Café API running on port 5000
```

✅ Backend is now running on `http://localhost:5000`

---

### Step 4: Set Up Staff Dashboard (Windows/Web)

```bash
# Navigate to dashboard directory (in a new terminal)
cd dashboard

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start the dashboard
npm start
```

The dashboard will open at `http://localhost:3000`

---

### Step 5: Set Up Mobile App (iOS/Android)

```bash
# Navigate to mobile directory (in a new terminal)
cd mobile

# Install dependencies
npm install

# For Android:
npm run android

# For iOS:
npm run ios
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/sardo_cafe
PORT=5000
NODE_ENV=development
```

### Dashboard (.env)

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📊 Database Schema

### Tables

#### `menu_items`
```sql
id (INT) - Primary key
name (VARCHAR) - Item name
price (DECIMAL) - Price in Birr
category (VARCHAR) - Coffee, Beverages, etc.
description (TEXT) - Optional description
image_url (VARCHAR) - Optional image
is_available (BOOLEAN) - Availability status
created_at (TIMESTAMP) - Creation date
updated_at (TIMESTAMP) - Last update
```

#### `orders`
```sql
id (INT) - Primary key
table_number (INT) - Table number
items (JSONB) - Order items array
total_price (DECIMAL) - Total in Birr
status (VARCHAR) - pending, preparing, ready, completed
created_at (TIMESTAMP) - Order time
updated_at (TIMESTAMP) - Last update
completed_at (TIMESTAMP) - Completion time
```

---

## 🎯 Current Menu Items

| Item | Price | Category |
|------|-------|----------|
| Macchiato | 120 Birr | Coffee |
| Coffee | 90 Birr | Coffee |
| Latte | 120 Birr | Coffee |
| Ice Latte | 350 Birr | Coffee |

### Adding New Items

**Via Staff Dashboard:**
1. Open dashboard at `http://localhost:3000`
2. Click **"+ Add Item"**
3. Fill in name, price, category
4. Click **"Add to Menu"**

**Via API:**
```bash
curl -X POST http://localhost:5000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cappuccino",
    "price": 130,
    "category": "Coffee",
    "description": "Espresso with foam"
  }'
```

---

## 🔌 API Endpoints

### Menu Endpoints

**Get all menu items:**
```bash
GET /api/menu
```

**Add menu item:**
```bash
POST /api/menu
Content-Type: application/json

{
  "name": "Item name",
  "price": 100,
  "category": "Coffee",
  "description": "Optional"
}
```

**Update menu item:**
```bash
PUT /api/menu/:id
```

**Delete menu item:**
```bash
DELETE /api/menu/:id
```

### Order Endpoints

**Get all orders:**
```bash
GET /api/orders
```

**Place new order:**
```bash
POST /api/orders
Content-Type: application/json

{
  "table_number": 1,
  "items": [
    { "id": 1, "name": "Coffee", "price": 90, "quantity": 2 }
  ],
  "total_price": 180
}
```

**Update order status:**
```bash
PUT /api/orders/:id/status
Content-Type: application/json

{
  "status": "preparing"  // or "ready", "completed"
}
```

---

## 🎨 Theme Customization

### Colors (in `dashboard/src/App.css`)

```css
--dark-bg: #0f0f0f;           /* Dark background */
--gold: #d4af37;              /* Gold accent */
--gold-light: #e8c547;        /* Light gold */
--text-primary: #f5f5f5;      /* Main text */
--text-secondary: #b0b0b0;    /* Secondary text */
```

### Mobile Theme (in `mobile/App.js`)

Change color codes in the StyleSheet to customize the mobile app theme.

---

## 🐛 Troubleshooting

### Backend won't start

1. **Check PostgreSQL is running:**
   ```bash
   sudo service postgresql status  # Linux
   brew services list              # Mac
   ```

2. **Verify database connection:**
   ```bash
   psql -U username -d sardo_cafe -c "SELECT * FROM menu_items;"
   ```

3. **Check port 5000 is not in use:**
   ```bash
   lsof -i :5000  # Mac/Linux
   netstat -ano | findstr :5000  # Windows
   ```

### Dashboard won't connect to API

1. Ensure backend is running on port 5000
2. Check `.env` file has correct `REACT_APP_API_URL`
3. Check browser console for CORS errors

### Database connection errors

1. Verify PostgreSQL credentials in `.env`
2. Check database exists: `createdb sardo_cafe`
3. Run schema: `psql sardo_cafe < database/schema.sql`

---

## 📱 Testing the System

### Test Order Flow

1. **Mobile App:** Browse menu → Add Macchiato + Coffee → Place Order from Table 5
2. **Dashboard:** Should see new order appear instantly → Update status to "Preparing" → "Ready"
3. **Mobile App:** Should see order status update (optional feature to add)

---

## 🚀 Deployment

### Deploy Backend (Heroku)

```bash
heroku create sardo-cafe
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Deploy Dashboard (Vercel)

```bash
npm install -g vercel
vercel
```

### Deploy Mobile App

- **iOS:** Build with Xcode → TestFlight → App Store
- **Android:** Build with Android Studio → Google Play Store

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review error logs in console
3. Check GitHub Issues: https://github.com/Zazu-das/sardo-cafe/issues

---

## 📄 License

MIT License - Feel free to use and modify!

---

**Happy serving! 🎬☕**
