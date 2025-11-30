#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=${PROJECT_ID:-your-gcp-project}
REGION=${REGION:-us-central1}
SERVICE_NAME=${SERVICE_NAME:-ecommerce-backend}
IMAGE="gcr.io/${PROJECT_ID}/ecommerce-backend:latest"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/app/backend"

cd "${REPO_ROOT}"

echo "Building and submitting container image to Google Artifact Registry..."
gcloud config set project "${PROJECT_ID}" 1>/dev/null
gcloud builds submit "${BACKEND_DIR}" --tag "${IMAGE}"

ENV_VARS=$(grep -v '^#' "${BACKEND_DIR}/.env.production" | grep -v '^$' | paste -sd, -)

echo "Deploying image to Cloud Run service ${SERVICE_NAME} (${REGION})..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "${ENV_VARS}"

echo "Deployment triggered. Verify service status via 'gcloud run services describe ${SERVICE_NAME} --region ${REGION}'."
