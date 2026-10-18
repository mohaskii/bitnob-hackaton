# TekkiTrade: API + built PWA in one Deno container (see compose.yaml).
# Debian rather than Alpine: Vite's native binaries (esbuild, rollup) and the
# SQLite library are the standard glibc ones.
FROM denoland/deno:debian
WORKDIR /app

# SQLite for @db/sqlite (FFI)
RUN apt-get update \
  && apt-get install -y --no-install-recommends libsqlite3-0 \
  && rm -rf /var/lib/apt/lists/*
ENV DENO_SQLITE_PATH=/usr/lib/x86_64-linux-gnu/libsqlite3.so.0

COPY . .

# Build the PWA (app/dist, served by api/server.ts) and cache the server
RUN deno task build && deno cache api/server.ts

# Demo mode on purpose: APP_ENV=prod turns the SGI partner space off.
ENV APP_ENV=dev
ENV PORT=8000
ENV DATABASE_PATH=/app/data/tekkitrade.db
RUN mkdir -p /app/data

# Keys come from the environment (compose: .env-prod), never from the image.
EXPOSE 8000
VOLUME /app/data
CMD ["deno", "run", "-A", "--unstable-worker-options", "--unstable-ffi", "api/server.ts"]
