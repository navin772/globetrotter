#!/bin/bash

# Start MongoDB if not already running
echo "Checking if MongoDB is running..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath /tmp/mongodb.log
    if [ $? -ne 0 ]; then
        echo "Failed to start MongoDB. Please make sure it's installed correctly."
        exit 1
    fi
    echo "MongoDB started successfully."
else
    echo "MongoDB is already running."
fi

# Start backend in a new terminal
echo "Starting backend server..."
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && python run.py"'

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