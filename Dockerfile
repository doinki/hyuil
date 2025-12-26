FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM base AS release

COPY --from=prerelease --chown=bun:bun /usr/src/app/dist dist
COPY --from=prerelease --chown=bun:bun /usr/src/app/package.json .

USER bun
EXPOSE 3000/tcp
ENV NODE_ENV=production
ENV TZ=Asia/Seoul

ENTRYPOINT [ "bun", "dist/app.js" ]
