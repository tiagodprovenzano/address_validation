# ---- Build stage ----
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies
COPY address_validator/package*.json ./address_validator/
# No package-lock.json yet, so use npm install
RUN cd address_validator && npm install --omit=dev --legacy-peer-deps

# Copy source code
COPY address_validator/ ./address_validator/

# Build the NestJS project (outputs to dist/)
RUN cd address_validator && npm run build

# ---- Production stage ----
FROM node:18-alpine AS runtime
WORKDIR /app

# Copy built application and node_modules from builder stage
COPY --from=builder /app/address_validator /app

EXPOSE 3000

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