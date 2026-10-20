# Backend: Node 22 + tsx (ganti Bun karena Bun hang/spin di kernel VPS).
# Prisma CLI & app jalan di Node asli. Source ikut terbawa agar bisa
# dibuka dari container: docker exec -it lab-backend sh
FROM node:22-bookworm-slim AS base
WORKDIR /app

# OpenSSL untuk Prisma engine (hilangkan warning libssl + aman untuk koneksi DB)
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies dulu agar layer ter-cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy source + prisma (dibutuhkan untuk generate & migrate)
COPY tsconfig.json prisma.config.ts index.ts server-node.ts ./
COPY prisma ./prisma
COPY src ./src
COPY lib ./lib

# Generate Prisma Client (output: generated/prisma, lihat prisma/schema.prisma)
RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Migrate lalu jalankan Hono via tsx
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx server-node.ts"]
