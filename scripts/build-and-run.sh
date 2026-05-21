#!/bin/bash

# Build and Run Script for TampIt
# This script builds the server and client, runs migrations, and starts Docker

set -e

echo "🚀 Starting TampIt build and Docker setup..."
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPT_DIR/.."

# Build Server
echo "📦 Building server..."
cd "$ROOT_DIR/server"
npm run build > /dev/null 2>&1
echo "✅ Server built successfully"
echo ""

# Build Client
echo "📦 Building client..."
cd "$ROOT_DIR/client"
npm run build > /dev/null 2>&1
echo "✅ Client built successfully"
echo ""

# Go back to root
cd "$ROOT_DIR"

# Run Docker Compose
echo "🐳 Starting Docker containers..."
echo ""
docker-compose up -d > /dev/null 2>&1

echo ""
echo "✅ All done! Your app is running:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:4000"
echo "  - GraphQL:  http://localhost:4000/graphql"
echo "  - Database: localhost:5433"
