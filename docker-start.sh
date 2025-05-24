#!/bin/bash

# Build and start Docker containers
echo "Building and starting Docker containers..."
docker-compose up -d --build

# Wait for containers to start
echo "Waiting for containers to start..."
sleep 5

# Check if containers are running
echo "Checking container status..."
docker ps

echo ""
echo "CalmWave application is now running!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000"
echo ""
echo "To stop the application, run: docker-compose down"