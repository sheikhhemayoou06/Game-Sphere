FROM node:20-bullseye-slim

# Install OpenSSL (required by Prisma)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and Prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Clean cache and install cleanly
RUN npm cache clean --force && rm -rf node_modules && npm ci

# Copy the rest of the backend files
COPY . .

# Force local Prisma 5 generate and build
RUN npx prisma@5.22.0 generate
RUN npx @nestjs/cli build

# Expose port
EXPOSE 4000

# Start the server directly. Migrations must be handled outside of the startup script or via Render's dedicated build hooks.
CMD ["npm", "run", "render:start"]
