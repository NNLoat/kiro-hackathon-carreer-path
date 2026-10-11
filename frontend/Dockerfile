# syntax=docker/dockerfile:1
FROM node:22-slim

# Enable pnpm via corepack (pinned by the "packageManager" field in package.json)
RUN corepack enable

WORKDIR /app

# Install dependencies first (cached unless the lockfile changes)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
