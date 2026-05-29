# ---- Stage 1: Build React app ----
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy source code (your src/, public/ folders etc.)
COPY . .

# Build the production bundle — outputs to /app/build
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine

# Copy the built React files into Nginx's web root
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]