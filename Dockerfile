FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
RUN corepack enable pnpm
RUN apk add --no-cache gcompat

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules node_modules
COPY . ./

RUN pnpm install --frozen-lockfile --offline && \
    pnpm build && \
    pnpm prune --ignore-scripts --prod

FROM base AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs && \
    chown -R nodejs:nodejs /app
    
COPY --from=builder --chown=nodejs:nodejs /app/node_modules node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist dist
COPY --chown=nodejs:nodejs package.json ./

USER nodejs

ENV NODE_ENV=production
ENV TZ=Asia/Seoul

CMD ["node", "dist/app.js"]