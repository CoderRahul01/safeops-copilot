# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S safeops && adduser -S safeops -G safeops

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy source code explicitly (avoiding root files and secrets)
COPY src ./src

# Set proper permissions
RUN chown -R safeops:safeops /app

# Switch to non-root user
USER safeops

EXPOSE 8080
ENV NODE_ENV=production

CMD ["node", "src/server.js"]
