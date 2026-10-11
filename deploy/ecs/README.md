# Deploying Course & Career Navigator to Amazon ECS (Fargate)

This deploys the app as a **single same-origin container** on **ECS Fargate**, backed by
**Amazon RDS for PostgreSQL**. The container (built from `Dockerfile.prod` at the repo root)
runs FastAPI, which serves both the built React SPA and the `/api` endpoints on port `8000`.
No ALB path-routing or CORS is required because the UI and API share one origin.

```
                       ┌────────────────────────────────────────┐
   Internet ──▶ (ALB/public IP) ──▶  ECS Fargate task :8000      │
                       │   FastAPI  ├─ GET /            -> SPA    │
                       │            ├─ GET /assets/*    -> static │
                       │            └─ /api/*           -> API    │
                       └───────────────────────┬────────────────┘
                                                │ DATABASE_URL (Secrets Manager)
                                                ▼
                                     Amazon RDS for PostgreSQL
```

## Contents of `deploy/ecs/`
| File | Purpose |
|---|---|
| `task-definition.json` | Fargate task definition (placeholders `<ACCOUNT_ID>`, `<REGION>`). |
| `config.env.example` | Shared variables for the scripts — copy to `config.env` and edit. |
| `build-and-push.sh` | Build `Dockerfile.prod` (linux/amd64) and push to ECR. |
| `deploy.sh` | Register a task revision and create/update the ECS service. |

## Prerequisites
- AWS CLI v2, authenticated (`aws sts get-caller-identity` works).
- Docker with buildx (the build forces `linux/amd64` for Fargate X86_64).
- An **ECS cluster** (Fargate). Create one if needed:
  ```bash
  aws ecs create-cluster --cluster-name career-navigator --region "$AWS_REGION"
  ```
- The **`ecsTaskExecutionRole`** IAM role (pull from ECR, write logs, read the secret).
  If you don't have it, create it with the `AmazonECSTaskExecutionRolePolicy` managed policy
  and add `secretsmanager:GetSecretValue` for the DB secret.
- A VPC with subnets + a security group allowing inbound TCP `8000` from your ALB (or your IP
  for a quick test).

## 1. Provision RDS PostgreSQL
Create a PostgreSQL instance (console or CLI). Minimal example (adjust to your VPC/SG):
```bash
aws rds create-db-instance \
  --db-instance-identifier career-navigator-db \
  --engine postgres --engine-version 17 \
  --db-instance-class db.t4g.micro \
  --allocated-storage 20 \
  --master-username app \
  --master-user-password '<STRONG_PASSWORD>' \
  --db-name app \
  --vpc-security-group-ids <DB_SG> \
  --no-publicly-accessible \
  --region "$AWS_REGION"
```
The ECS task's security group must be allowed to reach the RDS security group on `5432`.

## 2. Store the database URL in Secrets Manager
The app reads a single SQLAlchemy URL from `DATABASE_URL`. Create the secret:
```bash
aws secretsmanager create-secret \
  --name career-navigator/database-url \
  --secret-string 'postgresql+psycopg://app:<STRONG_PASSWORD>@<RDS_ENDPOINT>:5432/app' \
  --region "$AWS_REGION"
```
> Note the driver prefix `postgresql+psycopg://` (psycopg 3), matching the backend.

## 3. Configure the scripts
```bash
cp deploy/ecs/config.env.example deploy/ecs/config.env
# edit AWS_REGION, AWS_ACCOUNT_ID, SUBNET_IDS, SECURITY_GROUP_ID, etc.
source deploy/ecs/config.env
```

## 4. Build and push the image to ECR
```bash
./deploy/ecs/build-and-push.sh
```
Creates the ECR repo if missing, logs in, builds `Dockerfile.prod` for `linux/amd64`, and
pushes `…/career-navigator:latest`.

## 5. Register the task and create/update the service
```bash
./deploy/ecs/deploy.sh
```
This substitutes the placeholders in `task-definition.json`, points the container at your ECR
image and DB secret, registers a new revision, and creates the service (or updates it with a
forced new deployment if it already exists). Watch the rollout:
```bash
aws ecs wait services-stable --cluster "$ECS_CLUSTER" --services "$ECS_SERVICE" --region "$AWS_REGION"
```

## 6. Reach the app
- **Quick test (public subnet, `assignPublicIp=ENABLED`)**: find the task's public IP:
  ```bash
  TASK=$(aws ecs list-tasks --cluster "$ECS_CLUSTER" --service-name "$ECS_SERVICE" \
          --query 'taskArns[0]' --output text --region "$AWS_REGION")
  ENI=$(aws ecs describe-tasks --cluster "$ECS_CLUSTER" --tasks "$TASK" \
          --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
          --output text --region "$AWS_REGION")
  aws ec2 describe-network-interfaces --network-interface-ids "$ENI" \
          --query 'NetworkInterfaces[0].Association.PublicIp' --output text --region "$AWS_REGION"
  ```
  Then open `http://<PUBLIC_IP>:8000/` (UI) and `http://<PUBLIC_IP>:8000/api/health`.
- **Production**: put an **Application Load Balancer** in front (target group → port `8000`,
  health check path `/api/health`) and attach it to the service. Then browse the ALB DNS name.

## Configuration reference (container env)
| Variable | Default (image) | Notes |
|---|---|---|
| `DATABASE_URL` | — (from secret) | `postgresql+psycopg://user:pass@host:5432/db` |
| `SERVE_STATIC` | `true` | Serve the built SPA from FastAPI. |
| `STATIC_DIR` | `/app/static` | Where the SPA was copied in the image. |
| `SEED_ON_STARTUP` | `true` | Idempotent catalog seed on boot (safe to leave on). |
| `APP_NAME` | `Career Navigator` | Shown in `/docs`. |

## Notes & scope
- **Schema**: created on startup via `SQLModel.metadata.create_all()` (prototype). It does not
  run migrations; introduce Alembic before evolving the schema in a long-lived environment.
- **Seeding** is idempotent (upsert), so restarts/redeploys are safe against RDS.
- **Scaling**: increase the ECS service desired count for more instances — the app is stateless
  except for the database.
- **Security**: this is a prototype (no auth). Lock down the security group, keep RDS private,
  and front the service with an ALB (optionally HTTPS via ACM) for anything shared.
- These artifacts **do not create AWS resources on their own** — nothing is provisioned until
  you run the scripts/commands above with real values.
