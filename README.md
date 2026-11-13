# Coffee Tracker

A full-stack app for logging coffee brews, rating them, and sharing recipes with other users. Roasters can manage their coffees, and users can follow roasters and each other.

## Stack

- **Client:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, MUI, SWR, Apollo Client, Storybook, Jest.
- **Server:** NestJS 12, TypeScript, Prisma 6 on PostgreSQL 15, REST and GraphQL, WebSockets, JWT auth with email verification and Google sign-in.
- **AI service:** Python 3.12 and FastAPI. Tesseract OCR reads coffee label photos, and rule-based extraction structures the text and finds roaster contact emails. No external AI API.
- **Infrastructure:** Docker Compose (Postgres, API, AI service, client). Deployment scripts for a single AWS EC2 instance live in `scripts/`.

## Project layout

```
client/      Next.js app (pages in app/, components and hooks in src/)
server/      NestJS API (feature modules in src/, Prisma schema in prisma/)
ai-service/  Python FastAPI service for OCR and text extraction (see AI_EXTRACTION_SETUP.md)
shared/      Types shared by client and server
scripts/     Docker helpers and EC2 deployment scripts
```

## Configuration

All secrets and environment-specific values come from `.env.local` files. Nothing is read from source code, and these files are git-ignored.

| File                | Used by               | Key variables                                                                                                                                   |
| ------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.local` (root) | Docker Compose        | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, `DEV_USER_EMAIL`, `DEV_USER_PASSWORD`, `GOOGLE_CLIENT_ID`                    |
| `server/.env.local` | API (host and Docker) | `DATABASE_URL`, `JWT_SECRET`, `DEV_USER_EMAIL`, `DEV_USER_PASSWORD`, `GOOGLE_CLIENT_ID`, `SMTP_*`, `AI_SERVICE_URL`, `APP_URL`, `CLIENT_ORIGIN` |
| `client/.env.local` | Next.js               | `API_URL`, `GOOGLE_CLIENT_ID`                                                                                                                   |

Generate `JWT_SECRET` with `openssl rand -hex 32`. The API refuses to start if `JWT_SECRET` is missing.

## Running with Docker

```bash
# Create the root env file (see the table above), then:
npm run docker            # docker-compose --env-file .env.local up
```

- Client: http://localhost:3000
- API: http://localhost:4000 (Swagger UI at `/api`)

Compose reads only `.env.local`, so always pass `--env-file .env.local` (the `docker:*` npm scripts already do). The server container runs Prisma migrations on startup.

## Running locally (without Docker)

You need a running PostgreSQL 15 instance, and `DATABASE_URL` set in `server/.env.local`.

```bash
# Root: install and start both apps in dev mode
npm install --legacy-peer-deps
npm run start            # API on :4000 and client on :3000

# Or run them separately
cd server && npm install --legacy-peer-deps && npx prisma migrate deploy && npm run dev
cd client && npm install --legacy-peer-deps && npm run dev
```

`--legacy-peer-deps` is needed because of peer-dependency conflicts in the dependency tree. The Dockerfiles use it too.

## Development data

`POST /dev/seed` wipes the database and loads demo roasters, coffees, entries, and recipes. It also signs in as the dev user and returns a session. This endpoint is for development only.

## Scripts

| Location | Command                         | What it does                              |
| -------- | ------------------------------- | ----------------------------------------- |
| root     | `npm run build`                 | Compile the server, then build the client |
| root     | `npm run docker:rebuild`        | Rebuild and restart the containers        |
| server   | `npm run dev`                   | API in watch mode                         |
| server   | `npm run build` / `npm start`   | Compile to `build/`, then run it          |
| client   | `npm run dev` / `npm run build` | Next.js dev server / production build     |
| client   | `npm test`                      | Jest unit tests (React Testing Library)   |

## Testing and quality

- Client unit tests: `cd client && npm test`.
- Storybook: `cd client && npm run storybook` (component stories live next to each component).
- TypeScript is strict in both packages.

## Notes

- The dev login account is created on API startup only when `DEV_USER_EMAIL` and `DEV_USER_PASSWORD` are set.
