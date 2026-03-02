# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20 AS builder

WORKDIR /app

# Copy workspace manifests first so Docker can cache the install layer
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

RUN git init && npm ci

# Copy source
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/server/src ./apps/server/src
COPY apps/server/tsconfig.json ./apps/server/

RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

# Copy workspace manifests (needed for workspace symlink resolution)
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# Reuse node_modules from builder so native addons (bcrypt) don't need recompiling
COPY --from=builder /app/node_modules ./node_modules
# Copy workspace-local node_modules (packages npm didn't hoist to root)
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules

# Copy compiled output
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 3000

CMD ["node", "apps/server/dist/app/app.js"]
