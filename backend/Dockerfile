FROM node:18-alpine

WORKDIR /app

# Copy package files first (Docker caches this layer — faster rebuilds)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy everything EXCEPT node_modules (handled by .dockerignore)
COPY . .

# Your Express server runs on this port (change if yours is different)
EXPOSE 5000

CMD ["node", "server.js"]