FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Install web dependencies manquantes
RUN npx expo install react-dom react-native-web @expo/metro-runtime --legacy-peer-deps

COPY . .

# Build the web export
RUN npx expo export --platform web

# ── Production stage ──────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
