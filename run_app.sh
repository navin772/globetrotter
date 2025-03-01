#!/bin/bash

# Start backend in a new terminal
echo "Starting backend server..."
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && conda run -n globe python run.py"'

# Start frontend in a new terminal
echo "Starting frontend server..."
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/frontend && npm start"'

echo "Globetrotter application is starting..."
echo "Backend will be available at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop this script (Note: This won't stop the servers)"
echo "To stop the servers, close the terminal windows that were opened."

# Keep the script running
while true; do
    sleep 1
done