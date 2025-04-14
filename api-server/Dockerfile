# ベースイメージ
FROM python:3.12-alpine

# 作業ディレクトリを設定
WORKDIR /api-server

# 必要なパッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# FastAPIサーバーを起動
CMD ["uvicorn", "rest-api:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
