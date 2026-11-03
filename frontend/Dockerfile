# ---  1: Builder ---
FROM node:22-bookworm AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
 
# ---  2: Development ---
FROM node:22-bookworm AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# default port 5173
CMD ["npm", "run", "dev"]
 
# --- 3: Production ---
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]