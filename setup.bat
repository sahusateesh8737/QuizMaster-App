@echo off
REM Quiz Application Setup Script for Windows

echo.
echo ===================================
echo Quiz Application - Setup Script
echo ===================================
echo.

REM Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 is not installed. Please install Python 3.11+
    exit /b 1
)
echo ✓ Python 3 is installed

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)
echo ✓ Node.js is installed
echo.

REM Backend Setup
echo Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo ✓ Virtual environment created
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo ✓ Dependencies installed

REM Create .env file
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo ✓ .env file created
)

REM Run migrations
echo Running database migrations...
python manage.py migrate
echo ✓ Database migrations completed

REM Collect static files
echo Collecting static files...
python manage.py collectstatic --noinput
echo ✓ Static files collected

echo.
echo Backend setup completed!
echo.

REM Frontend Setup
echo Setting up Frontend...
cd ..\frontend

REM Install dependencies
echo Installing Node dependencies...
call npm install
echo ✓ Dependencies installed

echo.
echo Frontend setup completed!
echo.

REM Summary
echo ===================================
echo ✓ Setup Complete!
echo ===================================
echo.
echo Next steps:
echo 1. Backend:
echo    cd backend
echo    venv\Scripts\activate
echo    python manage.py createsuperuser
echo    python manage.py runserver
echo.
echo 2. Frontend (in a new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000/api
echo    - Admin Panel: http://localhost:8000/admin
echo.
pause
