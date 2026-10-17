@echo off
echo ========================================================
echo   DRQR - Medical Health Care Management System
echo   React + Django REST Framework + Supabase PostgreSQL
echo ========================================================
echo.

echo Starting Django REST API Backend on http://127.0.0.1:8000 ...
start "DRQR Backend (Django)" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python manage.py runserver 127.0.0.1:8000"

timeout /t 3 /nobreak >nul

echo Starting React + Vite Frontend on http://127.0.0.1:5173 ...
start "DRQR Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ========================================================
echo   Both servers are starting up!
echo   Frontend: http://127.0.0.1:5173
echo   Backend:  http://127.0.0.1:8000
echo ========================================================
echo.
