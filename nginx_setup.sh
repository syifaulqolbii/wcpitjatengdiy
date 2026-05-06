#!/bin/bash
set -e

# Copy config Nginx
sudo cp nginx.conf /etc/nginx/sites-available/wcp
sudo ln -sf /etc/nginx/sites-available/wcp \
            /etc/nginx/sites-enabled/wcp

# Hapus default config jika ada
sudo rm -f /etc/nginx/sites-enabled/default

# Test config Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "Nginx configured!"
echo "Jalankan berikutnya:"
echo "sudo certbot --nginx -d wcp.it-jaya.id"
