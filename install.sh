#!/bin/bash

echo "============================================"
echo "   PAPADIN SYSTEM - Setup Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Python is not installed!"
    echo "Please install Python from: https://www.python.org/"
    exit 1
fi

echo -e "${GREEN}[INFO]${NC} Node.js and Python detected!"
echo ""

# Install Frontend Dependencies
echo "============================================"
echo "[1/3] Installing Frontend Dependencies..."
echo "============================================"
cd papadin-frontend
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} Frontend dependencies installed!"
    else
        echo -e "${RED}[ERROR]${NC} Frontend installation failed!"
        exit 1
    fi
else
    echo -e "${RED}[ERROR]${NC} package.json not found in papadin-frontend!"
    exit 1
fi
cd ..
echo ""

# Install Backend Dependencies
echo "============================================"
echo "[2/3] Installing Backend Dependencies..."
echo "============================================"
cd papadin-backend
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} Backend dependencies installed!"
    else
        echo -e "${RED}[ERROR]${NC} Backend installation failed!"
        exit 1
    fi
else
    echo -e "${RED}[ERROR]${NC} package.json not found in papadin-backend!"
    exit 1
fi
cd ..
echo ""

# Install Python Dependencies
echo "============================================"
echo "[3/3] Installing Python AI Dependencies..."
echo "============================================"
cd papadin-ai

# Create virtual environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[INFO]${NC} Creating Python virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR]${NC} Failed to create virtual environment!"
        exit 1
    fi
fi

# Activate and install
source venv/bin/activate
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} Python dependencies installed!"
    else
        echo -e "${RED}[ERROR]${NC} Python dependencies installation failed!"
        exit 1
    fi
else
    echo -e "${RED}[ERROR]${NC} requirements.txt not found!"
    exit 1
fi
deactivate
cd ..
echo ""

echo "============================================"
echo "   Installation Complete!"
echo "============================================"
echo ""
echo "Next Steps:"
echo "1. Add serviceAccountKey.json to papadin-backend/"
echo "2. Create .env file in papadin-ai/ with your OPENAI_API_KEY"
echo "3. Update Firebase config in src/firebase.js"
echo "4. Run ./start.sh to launch all services"
echo ""
echo "Make scripts executable:"
echo "  chmod +x start.sh"
echo ""
