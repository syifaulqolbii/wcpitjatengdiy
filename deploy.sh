#!/bin/bash
set -e
echo "🚀 Deploying WC26 Predictor..."

# Pull latest dari GitHub
git pull origin main

# Stop container lama
docker compose --env-file .env.production down

# Build image baru
docker compose --env-file .env.production build --no-cache

# Start containers
docker compose --env-file .env.production up -d

# Tunggu DB ready
echo "Waiting for database..."
sleep 15

# Jalankan migration
docker compose --env-file .env.production exec app npx drizzle-kit migrate

echo "Deploy selesai!"
echo "🌐 App running di port 3000"
