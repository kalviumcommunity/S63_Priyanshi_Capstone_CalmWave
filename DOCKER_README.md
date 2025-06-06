# Docker Setup for CalmWave Application

This document provides instructions for setting up and running the CalmWave application using Docker.

## Prerequisites

- Docker Desktop installed on your machine
- Git repository cloned to your local machine

## Environment Setup

<<
# Google OAuth Configuration
GOOGLE_CLIENT_ID=<your_google_client_id_here>
GOOGLE_CLIENT_SECRET=<your_google_client_secret_here>


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