FROM node:20-slim AS deps
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/pawsmart/package.json ./artifacts/pawsmart/
COPY scripts/package.json ./scripts/
RUN pnpm install --frozen-lockfile

FROM deps AS build-frontend
WORKDIR /app
COPY lib/ ./lib/
COPY attached_assets/ ./attached_assets/
COPY artifacts/pawsmart/ ./artifacts/pawsmart/
RUN pnpm --filter @workspace/pawsmart run build

FROM deps AS build-backend
WORKDIR /app
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
RUN pnpm --filter @workspace/api-server run build

FROM node:20-slim AS production
WORKDIR /app
COPY --from=build-backend /app/artifacts/api-server/dist ./dist
COPY --from=build-frontend /app/artifacts/pawsmart/dist/public ./pawsmart-dist
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
