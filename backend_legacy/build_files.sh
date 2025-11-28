#!/bin/bash

# Build script for Vercel deployment
echo "Building project..."

# Collect static files
python manage.py collectstatic --noinput --settings=config.settings.vercel

echo "Build complete!"
