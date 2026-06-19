#!/bin/bash
set -euo pipefail

APP_ROOT="/home/darigoshin/domains/igoshina-line.ru/app"
PUBLIC_HTML="/home/darigoshin/domains/igoshina-line.ru/public_html"

echo "Creating app directory..."
mkdir -p "$APP_ROOT"

echo "Extracting deploy archive into app directory..."
cd "$APP_ROOT"
tar -xzf "$PUBLIC_HTML/deploy-minimal.tar.gz"

echo "Installing dependencies..."
npm22 install --production=false --no-audit --no-fund

echo "Copying Passenger .htaccess to public_html..."
cp "$APP_ROOT/.htaccess" "$PUBLIC_HTML/.htaccess"

# To reset and re-seed the database, run manually:
# mysql -u DB_USER -p DB_NAME < db/fresh-schema.sql
# npx tsx db/seed.ts

echo "Restarting Passenger..."
mkdir -p tmp
rm -f tmp/restart.txt
touch tmp/restart.txt

echo "Done. Check domain in a few seconds."
