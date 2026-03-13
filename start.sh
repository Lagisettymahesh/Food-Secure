#!/bin/bash
echo "========================================"
echo "  Food Rescue - Starting Application"
echo "========================================"
echo ""

echo "[1/4] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then echo "Error in backend install"; exit 1; fi

echo "[2/4] Setting up database..."
npx prisma generate
npx prisma db push
node seed.js
cd ..

echo "[3/4] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "========================================"
echo "  Starting servers..."
echo "========================================"
echo ""
echo "Backend: http://localhost:5002"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd backend && node server.js &
BACKEND_PID=$!

# Wait a moment
sleep 2

# Start frontend in background
cd frontend && npm run dev &
FRONTEND_PID=$!

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Servers are running!"
wait
