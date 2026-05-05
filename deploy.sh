#!/bin/bash
set -e
echo "🚀 Deploying WC26 Predictor..."

# Pull latest dari GitHub
git pull origin main

# Stop container lama
docker compose down

# Build image baru
docker compose build --no-cache

# Start containers
docker compose up -d

# Tunggu DB ready
echo "Waiting for database..."
sleep 15

# Jalankan migration
docker compose exec app npx drizzle-kit migrate

echo "Deploy selesai!"
echo "🌐 App running di port 3000"
