# syntax=docker/dockerfile:1

# ─── Stage 1: build ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Cache dependencies: only re-run npm ci when these two change
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Allow overriding build-time vars (fall back to the values in .env)
ARG VITE_API_URL
ARG VITE_GRAFANA_URL
ARG VITE_BRAND_NAME
ARG VITE_SUPPORT_EMAIL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GRAFANA_URL=$VITE_GRAFANA_URL
ENV VITE_BRAND_NAME=$VITE_BRAND_NAME
ENV VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL

RUN npm run build

# ─── Stage 2: serve ──────────────────────────────────────────────
# Tiny nginx:alpine — only the built static assets, no node_modules
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
