# Building and Running TampIt

This guide explains how to build and run the TampIt application using various methods.

## Quick Start (Local Development)

```bash
npm start
```

This runs the server and client in development mode with hot reloading.

## Building for Production

### Build Both Server and Client

```bash
npm run build
```

Or build them individually:

```bash
npm run build:server
npm run build:client
```

## Docker

### Start with Docker Compose

```bash
npm run docker
```

This starts all services (PostgreSQL, server, and client) in Docker containers.

### Docker Compose Commands

```bash
# Start containers
npm run docker

# Stop containers
npm run docker:down

# Rebuild images
npm run docker:build

# Full rebuild (down, build, up)
npm run docker:rebuild

# Reset everything including database
npm run docker:reset
```

## Build Scripts

### PowerShell Script (Windows)

Run the complete build and Docker setup:

```powershell
.\scripts\build-and-run.ps1
```

This script:

1. Builds the server
2. Builds the client
3. Starts Docker containers

### Bash Script (Linux/Mac/WSL)

```bash
bash ./scripts/build-and-run.sh
```

## Database Migrations

### Run Pending Migrations

```bash
npm run migrate
```

### Create New Migration

```bash
npm run migrate:new
```

Migrations are automatically run when the server starts in Docker.

## Service URLs

When running locally:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Database**: localhost:5433 (PostgreSQL)

When running in Docker:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Database**: localhost:5433 (PostgreSQL)

## Environment Variables

### Server (`.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/tampit_dev
JWT_SECRET=dev-secret-change-in-prod
NODE_ENV=development
PORT=4000
```

### Client (`.env.local`)

```
API_URL=http://localhost:4000
```

## Troubleshooting

### Port Already in Use

If port 3000 or 4000 is already in use:

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000 (macOS/Linux)
lsof -ti:4000 | xargs kill -9

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force
```

### Docker Issues

Clear Docker resources:

```bash
# Remove all containers
docker container prune -f

# Remove all images
docker image prune -f

# Remove all volumes
docker volume prune -f

# Full reset
npm run docker:reset
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check the DATABASE_URL in `.env`
3. Verify the database exists: `tampit_dev`
4. Run migrations: `npm run migrate`

## Development Tips

- Use `npm start` for local development with hot reloading
- Use `npm run docker` for containerized development
- Keep both terminal windows open to see server and client logs
- Use GraphQL Playground to test GraphQL queries/mutations
- Check the console for errors and API calls

## Production Deployment

1. Build both applications: `npm run build`
2. Use Docker: `docker-compose -f docker-compose.prod.yml up`
3. Set proper environment variables for production
4. Run database migrations: `npm run migrate`
5. Set `NODE_ENV=production`
