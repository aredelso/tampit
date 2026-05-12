# Coffee Tracker

A monorepo with a Vite + React TypeScript client and a Node + Express + TypeScript server with Prisma + SQLite.

Quick start (PowerShell):

Set-Location "${workspaceFolder}"; npm install; npm run start

Client: go to `client/` and run `npm install` then `npm run dev`.

Server: go to `server/` and run `npm install` then `npm run dev`. Run `npx prisma migrate dev --name init` to create the SQLite DB after defining models in `server/prisma/schema.prisma`.
