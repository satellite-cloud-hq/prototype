# ベースイメージ
FROM node:23-slim

# 作業ディレクトリを設定
WORKDIR /web-console

# 必要なパッケージをインストール
COPY package.json package-lock.json ./
RUN npm install

# アプリケーションコードをコピー
COPY . .

# 開発サーバーを起動
CMD ["npm", "run", "dev", "--", "--host"]
