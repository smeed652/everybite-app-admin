# Multi-stage Dockerfile for everybite-app-admin
# Uses stable Node 18 LTS and Nginx stable

# ---------- base ----------
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# ---------- deps ----------
# Install production dependencies separately so they can be cached
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- builder ----------
# Build the production bundle
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- dev runtime ----------
FROM base AS dev
COPY package*.json ./
RUN npm install  # include dev deps for Vite hot reload
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------- production runtime ----------
FROM nginx:stable-alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
