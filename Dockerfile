# ============================================================
# Hansen Solubility Tool — Multi-stage Dockerfile
# ============================================================

# Stage 1: dependencies (キャッシュ最適化)
FROM node:20-bookworm-slim AS deps

# better-sqlite3ビルドに必要なネイティブ依存
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
RUN npm rebuild better-sqlite3

# Stage 2: dev (テスト実行・ウォッチモード用)
FROM node:20-bookworm-slim AS dev

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

CMD ["npm", "run", "test:watch"]

# Stage 3: test (CI向け、カバレッジ付き)
FROM dev AS test

CMD ["npx", "vitest", "run", "--coverage"]
