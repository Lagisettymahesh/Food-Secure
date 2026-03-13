@echo off
echo ========================================
echo   Food Rescue - Starting Application
echo ========================================
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 goto :error

echo [2/4] Setting up database...
call npx prisma generate
call npx prisma db push
call node seed.js
cd ..

echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo   Starting servers...
echo ========================================
echo.
echo Backend: http://localhost:5002
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 2 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

goto :end

:error
echo.
echo Error occurred! Please check the messages above.
pause
exit /b 1

:end
echo Servers are running!
pause
