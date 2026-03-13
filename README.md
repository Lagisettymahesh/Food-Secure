# 🍽️ Food Rescue - Food Rescue Donation Platform

A full-stack web application for connecting food donors with NGOs and volunteers to reduce food waste and help those in need.

## 🚀 Features

- **Donor Portal** - Donate surplus food with location and pickup details
- **NGO Dashboard** - Claim and manage food donations
- **Volunteer System** - Real-time notifications and delivery tracking
- **Admin Panel** - Analytics, user management, and system oversight
- **Dark Mode** - Toggle between light and dark themes
- **Real-time Updates** - Socket.io for live donation status

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS v4, Vite
- **Backend**: Express.js, Prisma ORM, JWT Auth
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Real-time**: Socket.io
- **ML Service**: Python (optional food freshness prediction)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node seed.js  # Seed test data
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Donor | hello@downtowncafe.com | password123 |
| NGO | admin@cityrescue.org | password123 |
| Volunteer | sarah.volunteers@email.com | password123 |
| Admin | admin@foodsecure.com | password123 |

## 🌐 URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5002
- API: http://localhost:5002/api

## 🐳 Docker (Optional)

```bash
docker-compose up --build
```

## 📁 Project Structure

```
food/
├── frontend/          # React frontend
├── backend/          # Express API
│   ├── controllers/  # Route handlers
│   ├── routes/       # API routes
│   ├── prisma/       # Database schema
│   └── middleware/   # Auth middleware
└── ml_service/       # Python ML service
```

## 📄 License

MIT