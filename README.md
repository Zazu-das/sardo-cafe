# SARDO Café - Digital Menu & Ordering System

A vintage cinema-themed digital menu and ordering system for SARDO Café. Customers order from their tables via mobile app (iOS/Android), and staff manage orders on a Windows dashboard.

## Features

- 📱 **Mobile App** (React Native) - iOS & Android
- 💻 **Staff Dashboard** (Web) - Windows compatible
- 🎬 **Vintage Cinema Theme** - Dark luxury with gold accents
- ⚡ **Real-time Updates** - Orders appear instantly
- ✏️ **Easy Menu Management** - Add/edit items without coding
- 🔔 **Order Notifications** - Staff notified of new orders

## Current Menu

- Macchiato - 120 Birr
- Coffee - 90 Birr
- Latte - 120 Birr
- Ice Latte - 350 Birr

## Tech Stack

- **Frontend (Mobile)**: React Native
- **Frontend (Dashboard)**: React
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Real-time**: WebSockets
- **Hosting**: Heroku/Railway

## Project Structure

```
sardo-cafe/
├── backend/           # Node.js API server
├── mobile/            # React Native app
├── dashboard/         # Staff dashboard (React)
├── database/          # Database schemas & migrations
└── docs/              # Documentation
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL
- React Native CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/Zazu-das/sardo-cafe.git
cd sardo-cafe
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Start the development servers
```bash
npm run dev
```

## Contributing

Feel free to add new features, report bugs, or suggest improvements!

## License

MIT
