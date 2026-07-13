# Deployment Guide

CodeSync is fully containerized using Docker, allowing it to be deployed easily to any VPS (AWS EC2, DigitalOcean Droplet, etc.).

## Architecture

The stack consists of 3 containers:
1. **Frontend (Client)**: A multi-stage build that compiles the React Vite application and serves the static assets via Nginx on port 80.
2. **Backend (Server)**: A Node.js environment that serves the REST API and Socket.io server on port 5000. 
3. **Database (MongoDB)**: A MongoDB container mapped to a persistent Docker volume (`mongodb_data`).

### Sibling Containers (Docker Socket Mounting)
CodeSync dynamically executes code by spinning up isolated Docker containers (e.g., Python, GCC). To achieve this without the overhead and complexity of Docker-in-Docker (DinD), the backend container is configured to mount the host machine's Docker socket (`/var/run/docker.sock`). 

When the Node backend runs a Docker command, it is actually instructing the *host* Docker daemon to spin up a sibling container.

## Setup Instructions

1. **Clone the repository** on your VPS.
2. **Environment Variables**:
   Copy the example config:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with a strong `JWT_SECRET`.
3. **Start the Stack**:
   Ensure Docker and Docker Compose are installed on the host. Run:
   ```bash
   docker-compose up -d --build
   ```
4. **Proxy / SSL (Optional but Recommended)**:
   It is highly recommended to place an overarching reverse proxy (like Nginx Proxy Manager or Traefik) in front of the stack to handle SSL/TLS termination and route traffic to the `client` (port 80) and `server` (port 5000).
