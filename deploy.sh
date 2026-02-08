#!/bin/bash

# SafeOps Smart Deployment Script
# Targeted Project: arcane-dolphin-484007-f8

set -e

PROJECT_ID="arcane-dolphin-484007-f8"
BACKEND_SERVICE="safeops-backend"
FRONTEND_SERVICE="safeops-frontend"
REGION="us-central1"

FORCE_DEPLOY=false
if [[ "$1" == "--force" ]]; then
  FORCE_DEPLOY=true
fi

echo "----------------------------------------------------"
echo "🚀 Starting SafeOps Smart Deployment"
echo "🎯 Project ID: $PROJECT_ID"
echo "----------------------------------------------------"

# 0. Ensure correct project is set
gcloud config set project $PROJECT_ID

# Detect changes
BACKEND_CHANGED=false
FRONTEND_CHANGED=false

if [ "$FORCE_DEPLOY" = true ]; then
  BACKEND_CHANGED=true
  FRONTEND_CHANGED=true
  echo "🔥 Force deploy enabled. Deploying both services."
else
  # Check for changes in backend/
  if git diff --quiet HEAD~1 HEAD -- backend/ 2>/dev/null; then
    BACKEND_CHANGED=false
  else
    BACKEND_CHANGED=true
  fi

  # Check for changes in frontend/
  if git diff --quiet HEAD~1 HEAD -- frontend/ 2>/dev/null; then
    FRONTEND_CHANGED=false
  else
    FRONTEND_CHANGED=true
  fi

  # Fallback: If no changes detected in sub-directories, but we are running this, maybe it's the first time or something else changed
  if [ "$BACKEND_CHANGED" = false ] && [ "$FRONTEND_CHANGED" = false ]; then
    echo "❓ No changes detected in backend/ or frontend/ folders."
    echo "👉 Use './deploy.sh --force' to deploy anyway."
    exit 0
  fi
fi

# 1. Deploy Backend
if [ "$BACKEND_CHANGED" = true ]; then
  echo "📦 [1/2] Deploying Backend..."
  cd backend
  gcloud run deploy $BACKEND_SERVICE \
    --source . \
    --region $REGION \
    --set-env-vars "PROJECT_ID=$PROJECT_ID,USE_VERTEX_AI=true,NODE_ENV=production" \
    --allow-unauthenticated
  cd ..
else
  echo "⏩ Skipping Backend (no changes detected)."
fi

# Capture the backend URL (needed for frontend)
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)' 2>/dev/null || echo "https://safeops-backend-633136504840.us-central1.run.app")
echo "✅ Backend uplink status: $BACKEND_URL"

# 2. Deploy Frontend
if [ "$FRONTEND_CHANGED" = true ]; then
  echo "📦 [2/2] Deploying Frontend..."
  cd frontend
  
  FIREBASE_VARS="NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCbjstqjik_Kzfq1fSLhNTs3pw3YoCY15I,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=arcane-dolphin-484007-f8.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=arcane-dolphin-484007-f8,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=arcane-dolphin-484007-f8.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=633136504840,NEXT_PUBLIC_FIREBASE_APP_ID=1:633136504840:web:f89e19b62064900f52b1bd,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-DC3MVTERDK"
  TAMBO_VARS="NEXT_PUBLIC_TAMBO_API_KEY=tambo_L3Quyv7sCEKSualV287qutDF4D5p/v4zgproIXFCUgmF3bN7Z+5vgTVu/IDyfkVMeQwZ1Newkbi1A7rO8I2YsOMsoafOdqlel7CdS/MPiGA="

  gcloud run deploy $FRONTEND_SERVICE \
    --source . \
    --region $REGION \
    --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL,$FIREBASE_VARS,$TAMBO_VARS" \
    --set-build-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL,$FIREBASE_VARS,$TAMBO_VARS" \
    --allow-unauthenticated
  cd ..
else
  echo "⏩ Skipping Frontend (no changes detected)."
fi

echo "----------------------------------------------------"
echo "✨ SafeOps Deployment Process Complete!"
echo "----------------------------------------------------"
