FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml .
RUN corepack enable pnpm && pnpm fetch

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile --offline && \
    pnpm build && \
    pnpm prune --prod

FROM base AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs && \
    chown -R nodejs:nodejs /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist dist
COPY --chown=nodejs:nodejs package.json .

USER nodejs
ENV NODE_ENV=production
CMD ["node", "dist/app.js"]