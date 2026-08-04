# syntax=docker/dockerfile:1

# ─── Stage 1: build ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Cache dependencies: only re-run npm ci when these two change
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Allow overriding the API base URL at build time
# (falls back to the value baked into .env.production)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2: serve ──────────────────────────────────────────────
# Tiny nginx:alpine — only the built static assets, no node_modules
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
