# Docker Setup for CalmWave Application

This document provides instructions for setting up and running the CalmWave application using Docker.

## Prerequisites

- Docker Desktop installed on your machine
- Git repository cloned to your local machine

## Environment Setup

1. Copy the `.env.example` file to create a new `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Edit the `.env` file and replace the placeholder values with your actual credentials:

```
# MongoDB Connection
MONGO_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster>.mongodb.net/<your_database>

# JWT and Session Secrets (use strong random strings)
JWT_SECRET=<your_jwt_secret_key_here>
SESSION_SECRET=<your_session_secret_key_here>

# Google OAuth Configuration
GOOGLE_CLIENT_ID=<your_google_client_id_here>
GOOGLE_CLIENT_SECRET=<your_google_client_secret_here>
```

**Important Security Notes**: 
- Never commit the `.env` file with real credentials to the repository
- The `.env` file is already included in `.gitignore` to prevent accidental commits
- For production deployment, use environment variables in your deployment platform instead of files

## Building and Running with Docker Compose

1. Build and start the containers:

```bash
docker compose up -d --build
```

2. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8001

3. Stop the containers:

```bash
docker compose down
```

## Container Information

- **Frontend Container**: 
  - Built with Node.js and served with Nginx
  - Exposed on port 80
  - Access at: http://localhost

- **Backend Container**:
  - Built with Node.js
  - Runs on port 8000 inside the container
  - Mapped to port 8001 on your host machine
  - Access at: http://localhost:8001
  
**Note about port mapping**: The backend runs on port 8000 inside the Docker container, but we map it to port 8001 on your host machine to avoid conflicts with any existing services. This is why you access it via http://localhost:8001 even though the application itself runs on port 8000.

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

## Troubleshooting

- If you encounter port conflicts, you can modify the port mappings in the `docker-compose.yml` file.
- Check container logs for error messages: `docker logs <container-id>`
- Verify that environment variables are correctly set in the `.env` file.
- If the frontend cannot connect to the backend, ensure the BACKEND_URL environment variable is correctly set.

## Security Notes

- Never commit `.env` files with real credentials to the repository
- Use `.env.example` as a template for required environment variables
- Ensure `.env` is included in your `.gitignore` file