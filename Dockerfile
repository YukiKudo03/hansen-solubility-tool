FROM node:20-bookworm-slim

# better-sqlite3ビルドに必要なネイティブ依存
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 依存関係のキャッシュ最適化
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts || npm install --legacy-peer-deps
RUN npm rebuild better-sqlite3

# ソースコードをコピー
COPY . .

# デフォルトはテスト実行
CMD ["npm", "test"]
