FROM node:20-alpine AS builder

WORKDIR /app
# Copy everything first so any file change busts the cache
COPY . .
RUN npm ci && npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "server/index.js"]
