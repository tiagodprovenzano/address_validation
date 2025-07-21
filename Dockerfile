# Build stage
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY address_validator/package*.json address_validator/yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY address_validator/ ./

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Install production dependencies
COPY address_validator/package*.json address_validator/yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/scripts/data ./src/scripts/data

# Copy the convert script for seeding
COPY --from=builder /app/src/scripts/convert_data.ts ./src/scripts/

# Copy and make executable the startup script
COPY address_validator/seed-and-start.sh ./
RUN chmod +x seed-and-start.sh

# Install TypeScript and ts-node for running the script
RUN yarn add -D typescript ts-node @types/node

# Set environment variables for seeding
ENV WEAV_URL=http://weaviate:8080
ENV HF_MODEL=Xenova/all-MiniLM-L6-v2
ENV BATCH_SZ=64

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the API in production mode
CMD ["node", "dist/main"] 

# ---- Dev stage (for rapid local development) ----
FROM node:18-alpine AS dev
WORKDIR /app

# Install full deps (including dev)
COPY address_validator/package*.json ./address_validator/
RUN cd address_validator && npm install --legacy-peer-deps

# Copy source for live editing
COPY address_validator/ ./address_validator/

# Expose API port
EXPOSE 3000

# Use NestJS watch mode
WORKDIR /app/address_validator
CMD ["npm", "run", "dev"] 