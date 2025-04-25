#!/bin/sh
set -e

# 初期バケット生成後に influx CLI が利用可能になるまで少し待つ
sleep 2

# 追加バケットを作成
influx bucket create \
  --name telemetry \
  --org   "$DOCKER_INFLUXDB_INIT_ORG" \
  --token "$DOCKER_INFLUXDB_INIT_ADMIN_TOKEN"
  