FROM node:20-alpine

WORKDIR /app

# Install all deps (including devDeps for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build at image creation time
RUN npm run build

# Remove devDeps after build
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "server/index.js"]
