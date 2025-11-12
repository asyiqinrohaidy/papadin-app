#!/bin/bash

echo "============================================"
echo "   PAPADIN SYSTEM - Starting All Services"
echo "============================================"
echo ""
echo "This will start:"
echo "  1. React Frontend (Port 3000)"
echo "  2. Node.js Backend (Port 5001)"
echo "  3. Python AI Backend (Port 5000)"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup INT TERM

# Start Frontend
echo -e "${GREEN}[1/3]${NC} Starting React Frontend..."
cd papadin-frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait a moment
sleep 3

# Start Node.js Backend
echo -e "${GREEN}[2/3]${NC} Starting Node.js Backend..."
cd papadin-backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment
sleep 2

# Start Python AI Backend
echo -e "${GREEN}[3/3]${NC} Starting Python AI Backend..."
cd papadin-ai
source venv/bin/activate
python app.py &
AI_PID=$!
cd ..

echo ""
echo "============================================"
echo "   All Services Started!"
echo "============================================"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Node.js Backend: http://localhost:5001"
echo "  Python AI: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
