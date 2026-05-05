#!/bin/bash
set -e
echo "📦 Setting up VPS..."

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Install Nginx
apt install nginx -y

# Install Certbot
apt install certbot python3-certbot-nginx -y

# Install Git
apt install git -y

echo "VPS siap!"
echo "Jalankan: newgrp docker"
echo "Atau logout & login ulang agar docker group aktif"
