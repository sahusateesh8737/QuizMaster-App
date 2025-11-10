#!/bin/bash

# Quiz Application Setup Script
# This script automates the initial setup of the Quiz application

set -e

echo "🎯 Quiz Application - Setup Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required tools
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo -e "${GREEN}✓ Python 3 and Node.js are installed${NC}"
echo ""

# Backend Setup
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    # Generate random secret key
    SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))')
    sed -i.bak "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
    rm .env.bak 2>/dev/null || true
    echo -e "${GREEN}✓ .env file created with random SECRET_KEY${NC}"
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate
echo -e "${GREEN}✓ Database migrations completed${NC}"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput
echo -e "${GREEN}✓ Static files collected${NC}"

echo ""
echo -e "${BLUE}Backend setup completed!${NC}"
echo ""

# Frontend Setup
echo -e "${BLUE}Setting up Frontend...${NC}"
cd ../frontend

# Install dependencies
echo "Installing Node dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${BLUE}Frontend setup completed!${NC}"
echo ""

# Summary
echo -e "${GREEN}=================================="
echo "✓ Setup Complete!"
echo "==================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Backend:"
echo "   cd backend"
echo "   source venv/bin/activate  # Activate virtual environment"
echo "   python manage.py createsuperuser  # Create admin user"
echo "   python manage.py runserver  # Start development server"
echo ""
echo "2. Frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm run dev  # Start development server"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000/api"
echo "   - Admin Panel: http://localhost:8000/admin"
echo "   - API Documentation: http://localhost:8000/api/schema/swagger/"
echo ""
echo -e "${BLUE}For more information, see README.md and QUICKSTART.md${NC}"
