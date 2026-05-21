# Development Setup

## Architecture

The Tamplit coffee tracker app uses:
- **Frontend**: Next.js (port 3000)
- **Backend**: NestJS with GraphQL (port 4000)
- **Database**: PostgreSQL 16 running in WSL Ubuntu on `localhost:5432`

## Setup

### Prerequisites
- Windows 11 with WSL 2 (Ubuntu)
- Node.js 22+
- PostgreSQL 16 (running in WSL)

### One-time Setup

PostgreSQL is already configured in WSL and running. To verify:

```bash
# From Windows PowerShell
wsl.exe -d Ubuntu -u postgres -e psql -c "SELECT 1"
```

## Running the App

### Start Development Environment

From the project root directory:

```bash
npm start
```

This starts:
- Backend API on http://localhost:4000
- Frontend on http://localhost:3000
- Both connect to PostgreSQL at localhost:5432

### How It Works

The `npm start` command runs both services concurrently:
1. Backend (NestJS) starts first on port 4000
2. Frontend (Next.js) starts on port 3000
3. Backend connects to PostgreSQL in WSL
4. Frontend makes API calls to backend

## Database Notes

- PostgreSQL runs in WSL Ubuntu, not on Windows
- The `DATABASE_URL` in `.env` is set to `localhost:5432` which works from both Windows and WSL processes
- When the NestJS backend runs from Windows (via npm start), it connects through WSL's localhost interface
- **Don't run** `prisma migrate` directly from Windows - migrations are handled automatically by the running services

## Troubleshooting

### "Can't reach database server at localhost:5432" (when running migrations directly)
This happens when trying to run Prisma commands from Windows command line. The solution:
- Use the `npm start` approach instead, which includes database setup
- Or, run migrations from within WSL

### Port already in use (3000 or 4000)
Kill existing processes:
```powershell
# Port 3000
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force

# Port 4000  
Get-NetTCPConnection -LocalPort 4000 | Stop-Process -Force
```

### PostgreSQL not responding
Start PostgreSQL in WSL:
```bash
wsl.exe -d Ubuntu -u root -e service postgresql start
```

## API Testing

Once the app is running, you can test the API:

```bash
# Get coffees
curl http://localhost:4000/coffees

# Get entries
curl http://localhost:4000/entries

# GraphQL
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

## Database Schema

The schema is defined in `server/prisma/schema.prisma`. Changes to the schema are automatically applied when services start.

## VS Code Integration

For a better development experience in VS Code:
1. Install the "Thunder Client" or "REST Client" extension for API testing
2. Use the built-in terminal to run `npm start`
3. Frontend and backend both have hot reload enabled

## Environment Variables

See `server/.env` for configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Backend port (4000)
- `NODE_ENV`: development
- `JWT_SECRET`: for authentication
- `API_URL` (client): Backend URL for frontend to call

---

**Happy coding!** 🚀 The app should now run smoothly with proper Windows-to-WSL database connectivity.
