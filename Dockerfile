# Stage 1: Build the frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Install root dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

# Copy server code
COPY server ./server/

# Copy built frontend assets from client-builder
COPY --from=client-builder /app/client/dist ./client/dist/

EXPOSE 5000

CMD ["node", "server/index.js"]

