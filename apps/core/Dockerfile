# --- Base Stage ---
FROM oven/bun:1-alpine AS base
WORKDIR /app

# --- Deps Stage (full install) ---
FROM base AS deps
COPY package.json bun.lock* ./
COPY apps/core/package.json ./apps/core/
RUN bun install

# --- Builder Stage ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/core/node_modules ./apps/core/node_modules
COPY . .
WORKDIR /app/apps/core
RUN bun run build

# --- Runner Stage ---
FROM oven/bun:1-alpine AS runner
ENV NODE_ENV=production

# Remove unused Alpine packages and apk itself to minimize attack surface
RUN apk del --no-cache \
        apk-tools \
        ssl_client \
        busybox-suid && \
    rm -rf /var/cache/apk/* \
           /etc/apk \
           /lib/apk \
           /usr/share/apk \
           /sbin/apk \
    && addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --ingroup appgroup \
               --no-create-home --shell /bin/false appuser

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/core/node_modules ./apps/core/node_modules
COPY package.json bun.lock* ./
COPY apps/core/package.json ./apps/core/
RUN bun install --production --ignore-scripts --no-save 2>/dev/null || true && \
    rm -rf /root/.bun/install/cache

COPY --from=builder /app/apps/core/dist ./apps/core/dist
COPY apps/core/package.json ./apps/core/package.json

USER appuser
WORKDIR /app/apps/core
EXPOSE 3000
CMD ["bun", "run", "--smol", "dist/src/main.js"]
