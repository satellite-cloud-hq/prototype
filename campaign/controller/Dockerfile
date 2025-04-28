# ─── ベースイメージ ───────────────────────────
FROM python:3.11-slim

# ─── Docker CLI & Compose プラグインのインストール ────────
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       apt-transport-https \
       ca-certificates \
       curl \
       gnupg \
       lsb-release \
       gcc \
       g++ \
    # Docker GPG キー登録・リポジトリ追加
    && curl -fsSL https://download.docker.com/linux/debian/gpg \
       | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo \
       "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
       https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
       > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    # Docker CLI のみインストール
    && apt-get install -y --no-install-recommends docker-ce-cli \
    # Compose V2 プラグインを配置
    && mkdir -p /usr/local/lib/docker/cli-plugins \
    && curl -SL https://github.com/docker/compose/releases/download/v2.28.1/docker-compose-linux-x86_64 \
       -o /usr/local/lib/docker/cli-plugins/docker-compose \
    && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose \
    # キャッシュ削除
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY controller/requirements.txt .
RUN python3 -m venv /opt/venv \
    && . /opt/venv/bin/activate \
    && pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /campaign

COPY controller/api_server.py .
COPY compose.yaml .

COPY aobc-sils/ aobc-sils
COPY kble/ kble
COPY tlmcmd-bridge/ tlmcmd-bridge
COPY simulator/ simulator
COPY simulation-logger/ simulation-logger

COPY controller/entrypoint.sh . 
RUN chmod +x /campaign/entrypoint.sh
ENTRYPOINT ["/campaign/entrypoint.sh"]