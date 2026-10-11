#!/usr/bin/env bash
# Build the production image (Dockerfile.prod) and push it to Amazon ECR.
#
# Usage:
#   source deploy/ecs/config.env      # or export the vars yourself
#   ./deploy/ecs/build-and-push.sh
#
# Requires: AWS CLI v2 (authenticated), Docker with buildx.
set -euo pipefail

: "${AWS_REGION:?set AWS_REGION}"
: "${AWS_ACCOUNT_ID:?set AWS_ACCOUNT_ID}"
: "${ECR_REPO:?set ECR_REPO}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}"

# Repo root = two levels up from this script.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo ">> Ensuring ECR repository '${ECR_REPO}' exists..."
aws ecr describe-repositories --repository-names "${ECR_REPO}" --region "${AWS_REGION}" >/dev/null 2>&1 \
  || aws ecr create-repository --repository-name "${ECR_REPO}" --region "${AWS_REGION}" \
       --image-scanning-configuration scanOnPush=true >/dev/null

echo ">> Logging in to ECR (${REGISTRY})..."
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${REGISTRY}"

echo ">> Building ${IMAGE_URI} (linux/amd64) ..."
# Fargate X86_64 -> build amd64 explicitly (important when building on Apple Silicon).
docker build --platform linux/amd64 \
  -f "${ROOT}/Dockerfile.prod" \
  -t "${IMAGE_URI}" \
  "${ROOT}"

echo ">> Pushing ${IMAGE_URI} ..."
docker push "${IMAGE_URI}"

echo ">> Done. Image: ${IMAGE_URI}"
