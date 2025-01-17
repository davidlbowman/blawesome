# Step 1 - Use the Bun base image
FROM oven/bun:alpine AS base

# Step 2 - Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
COPY .env .env
RUN bun install --frozen-lockfile

# Step 3 - Build the application
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY .env .env
RUN bun run build

# Step 4 - Run the application
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

EXPOSE 3001
CMD ["bun", "run", "start"]