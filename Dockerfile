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
COPY --from=builder /app ./
COPY .env .env
EXPOSE 3000
CMD ["bun", "run", "start"]