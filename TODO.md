# Food Rescue - Running Instructions

## Current Status (Working)
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:5002  
- ✅ SQLite Database (no Docker needed)
- ✅ Dark mode toggle working

## Test Accounts (password: "password123")
- Donor: hello@downtowncafe.com
- NGO: admin@cityrescue.org
- Volunteer: sarah.volunteers@email.com

## How to Run (No Docker Required)

### 1. Start Frontend
```bash
cd frontend
npm run dev
```

### 2. Start Backend (in new terminal)
```bash
cd backend
npx prisma generate
node server.js
```

## Project Structure (FIXED)
- Frontend: React + Tailwind v4 (custom classes added)
- Backend: Express + Prisma + SQLite
- Schema: SQLite for local, PostgreSQL for Docker

## Key Fixes Applied:
1. Added btn-ghost, btn-secondary, badge-primary, badge-blue CSS classes
2. Added @custom-variant dark for Tailwind v4 dark mode
3. Added dark mode toggle in navigation
4. Fixed AdminPanel API endpoint (/admin/stats)
5. Fixed AuthForms API URL fallback
6. Changed Prisma to SQLite for local development

## To Switch to Docker/PostgreSQL:
1. Change backend/prisma/schema.prisma: provider = "postgresql"
2. Update backend/.env: DATABASE_URL=postgresql://...
3. Run: npx prisma generate && npx prisma db push
