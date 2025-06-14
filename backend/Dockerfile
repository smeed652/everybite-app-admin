# Backend Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install deps separately for caching
COPY package*.json ./
RUN npm install --omit=dev

COPY . .
EXPOSE 4000
CMD ["npm", "start"]
