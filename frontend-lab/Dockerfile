# ---- Build stage: Vite membake VITE_API_URL saat build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig*.json ./
COPY public ./public
COPY src ./src

# Wajib diisi saat build production, contoh:
# https://api.smkmiftahulkhaer.my.id
ARG VITE_API_URL
RUN if [ -z "$VITE_API_URL" ]; then echo "ERROR: VITE_API_URL build-arg kosong" >&2; exit 1; fi
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Serve stage: Alpine murni (tanpa nginx) ----
# Static server Node tanpa dependensi + source ikut terbawa
# agar bisa dibuka dari container: docker exec -it <frontend> sh
# lalu ls /app/src, cat /app/dist/index.html, dsb. Tetap listen 80
# untuk Caddy (reverse_proxy frontend:80).
FROM alpine AS serve
RUN apk add --no-cache nodejs
WORKDIR /app

COPY server.mjs ./server.mjs
COPY package.json ./package.json
COPY index.html ./index.html
COPY vite.config.ts ./vite.config.ts
COPY public ./public
COPY src ./src
COPY --from=build /app/dist ./dist

EXPOSE 80
CMD ["node", "server.mjs"]
