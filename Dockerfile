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

# Bring over built app and data
COPY --from=builder /app/build ./build
COPY --from=builder /app/data ./data

# Seed Railway volume on first boot with database and (optional) images
RUN mkdir -p /data/images \
  && cp /app/data/database.json /data/database.json \
  && if [ -d /app/data/images ]; then cp -r /app/data/images/. /data/images/; fi

CMD ["node", "build/index.js"]
