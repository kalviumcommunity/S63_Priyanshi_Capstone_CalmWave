# Docker Setup for CalmWave Application

This document provides instructions for running the CalmWave application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine

## Running the Application with Docker

### Option 1: Using Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd S63_Priyanshi_Capstone_CalmWave
   ```

2. Create a `.env` file in the root directory with the following environment variables:
   ```
   MONGO_URI=mongodb+srv://chittorapriyanshi10:priyanshi11@capstone.xynopm1.mongodb.net/
   JWT_SECRET=your_jwt_secret_key_here
   SESSION_SECRET=your_session_secret_key_here
   GOOGLE_CLIENT_ID=47887981736-s2pknb66l36ic7jobtdsh7osnh2g6kis.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   FRONTEND_URL=https://admirable-granita-160f9f.netlify.app/home
   BACKEND_URL=https://s63-priyanshi-capstone-calmwave-9.onrender.com
   ```

3. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000

5. To stop the containers:
   ```bash
   docker-compose down
   ```

### Option 2: Building and Running Individual Containers

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the Docker image:
   ```bash
   docker build -t calmwave-backend .
   ```

3. Run the container:
   ```bash
   docker run -p 8000:8000 --env-file .env -d calmwave-backend
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Build the Docker image:
   ```bash
   docker build -t calmwave-frontend .
   ```

3. Run the container:
   ```bash
   docker run -p 80:80 -d calmwave-frontend
   ```

## Docker Commands Reference

- View running containers:
  ```bash
  docker ps
  ```

- View logs for a container:
  ```bash
  docker logs <container-id>
  ```

- Stop a container:
  ```bash
  docker stop <container-id>
  ```

- Remove a container:
  ```bash
  docker rm <container-id>
  ```

- Remove an image:
  ```bash
  docker rmi <image-id>
  ```

## Troubleshooting

- If you encounter connection issues between containers, ensure they are on the same Docker network.
- Check container logs for error messages: `docker logs <container-id>`
- Verify that environment variables are correctly set in the `.env` file.
- If the frontend cannot connect to the backend, ensure the BACKEND_URL environment variable is correctly set.