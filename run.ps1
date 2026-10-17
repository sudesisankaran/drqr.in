# MediQR Launcher Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  MediQR - Medical Health Care Management System" -ForegroundColor White
Write-Host "  React + Django REST Framework + Supabase PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting Django REST Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver 127.0.0.1:8000"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting React Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Servers launched successfully!" -ForegroundColor Green
Write-Host "  Frontend Web Portal: http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "  Django REST API:     http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
