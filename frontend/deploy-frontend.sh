#!/bin/bash

# SafeOps Frontend Production Deployment Script
# This script ensures NEXT_PUBLIC_API_URL is injected AT BUILD TIME.

BACKEND_URL="https://safeops-backend-633136504840.us-central1.run.app"
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"

echo "🚀 Starting SafeOps Frontend Deployment..."
echo "🔗 Backend Uplink: $BACKEND_URL"

# 1. Build and Deploy using Google Cloud Build
# We pass NEXT_PUBLIC_API_URL as a build-arg to Docker
gcloud run deploy safeops-frontend \
  --source . \
  --region $REGION \
  --set-env-vars NEXT_PUBLIC_API_URL=$BACKEND_URL \
  --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL \
  --allow-unauthenticated

echo "✨ Deployment Complete!"
echo "📡 URL: https://safeops-frontend-633136504840.us-central1.run.app"
