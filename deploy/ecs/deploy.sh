#!/usr/bin/env bash
# Register a new task-definition revision (from task-definition.json with placeholders
# substituted) and create or update the ECS Fargate service to use it.
#
# Usage:
#   source deploy/ecs/config.env
#   ./deploy/ecs/deploy.sh
#
# Requires: AWS CLI v2 (authenticated), an existing ECS cluster, the ecsTaskExecutionRole,
# a CloudWatch log group (auto-created via awslogs-create-group), the DATABASE_URL secret,
# and a reachable RDS PostgreSQL instance referenced by that secret.
set -euo pipefail

: "${AWS_REGION:?set AWS_REGION}"
: "${AWS_ACCOUNT_ID:?set AWS_ACCOUNT_ID}"
: "${ECR_REPO:?set ECR_REPO}"
: "${ECS_CLUSTER:?set ECS_CLUSTER}"
: "${ECS_SERVICE:?set ECS_SERVICE}"
: "${TASK_FAMILY:?set TASK_FAMILY}"
: "${SUBNET_IDS:?set SUBNET_IDS}"
: "${SECURITY_GROUP_ID:?set SECURITY_GROUP_ID}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ASSIGN_PUBLIC_IP="${ASSIGN_PUBLIC_IP:-ENABLED}"
DATABASE_URL_SECRET_NAME="${DATABASE_URL_SECRET_NAME:-career-navigator/database-url}"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}"
SECRET_ARN="arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:${DATABASE_URL_SECRET_NAME}"

echo ">> Rendering task definition..."
RENDERED="$(mktemp)"
sed \
  -e "s#<ACCOUNT_ID>#${AWS_ACCOUNT_ID}#g" \
  -e "s#<REGION>#${AWS_REGION}#g" \
  "${DIR}/task-definition.json" > "${RENDERED}"

# Point the image + secret at the resolved values (handles custom tags / secret names).
python3 - "$RENDERED" "$IMAGE_URI" "$SECRET_ARN" <<'PY'
import json, sys
path, image, secret = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path) as f: d = json.load(f)
c = d["containerDefinitions"][0]
c["image"] = image
for s in c.get("secrets", []):
    if s["name"] == "DATABASE_URL":
        s["valueFrom"] = secret
with open(path, "w") as f: json.dump(d, f)
PY

echo ">> Registering task definition (${TASK_FAMILY})..."
TASK_DEF_ARN="$(aws ecs register-task-definition \
  --cli-input-json "file://${RENDERED}" \
  --region "${AWS_REGION}" \
  --query 'taskDefinition.taskDefinitionArn' --output text)"
echo "   -> ${TASK_DEF_ARN}"
rm -f "${RENDERED}"

NET_CONFIG="awsvpcConfiguration={subnets=[${SUBNET_IDS}],securityGroups=[${SECURITY_GROUP_ID}],assignPublicIp=${ASSIGN_PUBLIC_IP}}"

if aws ecs describe-services --cluster "${ECS_CLUSTER}" --services "${ECS_SERVICE}" \
     --region "${AWS_REGION}" --query 'services[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
  echo ">> Updating existing service ${ECS_SERVICE}..."
  aws ecs update-service \
    --cluster "${ECS_CLUSTER}" --service "${ECS_SERVICE}" \
    --task-definition "${TASK_DEF_ARN}" \
    --force-new-deployment \
    --region "${AWS_REGION}" >/dev/null
else
  echo ">> Creating service ${ECS_SERVICE}..."
  aws ecs create-service \
    --cluster "${ECS_CLUSTER}" --service-name "${ECS_SERVICE}" \
    --task-definition "${TASK_DEF_ARN}" \
    --desired-count 1 --launch-type FARGATE \
    --network-configuration "${NET_CONFIG}" \
    --region "${AWS_REGION}" >/dev/null
fi

echo ">> Deployment triggered. Watch rollout with:"
echo "   aws ecs wait services-stable --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
