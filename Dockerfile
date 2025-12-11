FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies for build (includes dev deps)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install only runtime dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Bring over built app
COPY --from=builder /app/build ./build

# No entrypoint needed - data initialization is handled by migration scripts
# Volume will be mounted at /data (or path specified by DATABASE_PATH/IMAGE_STORE env vars)
CMD ["node", "build/index.js"]
