# Multi-stage build for the Express API (pnpm monorepo).
FROM node:22-slim AS base
RUN corepack enable
WORKDIR /app

# --- Install all deps and build ---
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/validation/package.json ./packages/validation/
COPY server/package.json ./server/
RUN pnpm install --no-frozen-lockfile --prod=false
COPY packages/validation ./packages/validation
COPY server ./server
RUN pnpm --filter @form-builder/validation build \
  && pnpm --filter @form-builder/server build

# --- Production image (prod deps only) ---
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/validation/package.json ./packages/validation/
COPY server/package.json ./server/
RUN pnpm install --prod --no-frozen-lockfile
COPY --from=build /app/packages/validation/dist ./packages/validation/dist
COPY --from=build /app/server/dist ./server/dist
EXPOSE 8000
CMD ["node", "server/dist/server.js"]
