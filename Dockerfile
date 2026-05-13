FROM node:20-alpine AS builder

WORKDIR /app

# Force development pour inclure les devDependencies (babel-preset-expo etc.)
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

RUN EXPO_PLATFORM=web npx expo export --platform web

# ── Production stage ──────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
