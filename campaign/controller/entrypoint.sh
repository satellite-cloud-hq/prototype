#!/usr/bin/env bash

cd /campaign


docker compose build

# FastAPIサーバーを起動
uvicorn api_server:app --host 0.0.0.0 --port 80 --reload
