#!/usr/bin/env pwsh

# Build and Run Script for TampIt
# This script builds the server and client, runs migrations, and starts Docker

Write-Host "Starting TampIt build and Docker setup..." -ForegroundColor Cyan
Write-Host ""

# Check if docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if docker-compose is installed
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "Docker Compose is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Build Server
Write-Host "Building server..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\server"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Server build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Server built successfully" -ForegroundColor Green
Write-Host ""

# Build Client
Write-Host "Building client..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\client"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Client build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Client built successfully" -ForegroundColor Green
Write-Host ""

# Go back to root
Set-Location "$PSScriptRoot\.."

# Run Docker Compose
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
Write-Host ""
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker setup failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Run Prisma migrations
Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\server"
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Migrations failed" -ForegroundColor Red
    exit 1
}
Write-Host "Migrations completed" -ForegroundColor Green
Write-Host ""

# # Optional: Seed the database
# Write-Host "Seeding database with test data..." -ForegroundColor Yellow
# $maxAttempts = 30
# $attempt = 0
# while ($attempt -lt $maxAttempts) {
#     try {
#         $response = Invoke-RestMethod -Uri "http://localhost:4000/dev/seed" -Method POST -ContentType "application/json" -ErrorAction Stop
#         Write-Host "Database seeded: $($response.message)" -ForegroundColor Green
#         break
#     } catch {
#         $attempt++
#         if ($attempt -lt $maxAttempts) {
#             Write-Host "  Waiting for API to be ready... (attempt $attempt/$maxAttempts)" -ForegroundColor DarkYellow
#             Start-Sleep -Seconds 2
#         } else {
#             Write-Host "Could not seed database. API not ready after $maxAttempts attempts." -ForegroundColor Yellow
#             Write-Host "   You can manually run: curl -X POST http://localhost:4000/dev/seed" -ForegroundColor Cyan
#         }
#     }
# }

Write-Host ""
Write-Host "All done! Your app is running:" -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "  - GraphQL:  http://localhost:4000/graphql" -ForegroundColor Cyan
Write-Host "  - Database: localhost:5433" -ForegroundColor Cyan
