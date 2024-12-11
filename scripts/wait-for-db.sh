#!/bin/bash

# Wait for the database to be ready
until docker exec integration-tests pg_isready -U your_db_user; do
  echo "Waiting for database to be ready..."
  sleep 1
done

echo "Database is ready!"