# 🍽️ Food Rescue - Food Rescue Donation Platform

A full-stack web application for connecting food donors with NGOs and volunteers to reduce food waste and help those in need.

## 🚀 Quick Start

### Option 1: One-Click Run (Windows)
Double-click `start.bat` to install dependencies and run automatically.

### Option 2: One-Click Run (Mac/Linux)
```bash
chmod +x start.sh
./start.sh
```

### Option 3: Manual Setup

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
node seed.js
node server.js

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🌐 URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5002
- API: http://localhost:5002/api

## 🔐 Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Donor | hello@downtowncafe.com | password123 |
| NGO | admin@cityrescue.org | password123 |
| Volunteer | sarah.volunteers@email.com | password123 |
| Admin | admin@foodsecure.com | password123 |

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS v4, Vite
- **Backend**: Express.js, Prisma ORM, JWT Auth
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Real-time**: Socket.io

## 📦 Installation on New Computer

1. **Clone the repository:**
```bash
git clone https://github.com/Lagisettymahesh/Food-Secure.git
cd Food-Secure
```

2. **Run the startup script:**
   - Windows: Double-click `start.bat`
   - Mac/Linux: Run `./start.sh`

3. **Open browser:** http://localhost:5173

## 🐳 Docker Setup (Optional)
```bash
docker-compose up --build
```

## 📁 Project Structure
```
Food-Secure/
├── start.bat          # Windows startup
├── start.sh           # Mac/Linux startup
├── backend/           # Express API
│   ├── controllers/
│   ├── routes/
│   └── prisma/
├── frontend/          # React app
│   ├── src/
│   └── public/
└── ml_service/        # Python ML
```

## ✅ Requirements
- Node.js 18 or higher
- npm or yarn

## 📄 License
MIT
