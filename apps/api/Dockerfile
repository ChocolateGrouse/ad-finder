# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build the application
RUN npm run build --filter=api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/packages/shared/package*.json ./packages/shared/

RUN npm install --production

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

WORKDIR /app/apps/api

CMD ["node", "dist/index.js"]
