#!/bin/bash

# Load environment variables
if [ -f ../.env ]; then
  export $(cat ../.env | grep -v '#' | awk '/=/ {print $1}')
fi

# Ensure backup directory exists
mkdir -p ../backups

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="../backups/backup_$TIMESTAMP.sql"

echo "Creating backup at $BACKUP_FILE..."

# Use DATABASE_URL from .env
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

# Run pg_dump
# Note: Requires pg_dump installed on the system
pg_dump "$DATABASE_URL" --format=c --file="$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successful!"
  # Optional: Keep only last 7 days
  find ../backups -name "backup_*.sql" -mtime +7 -delete
else
  echo "Backup failed!"
  exit 1
fi
