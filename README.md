# プロトタイプ

# 開発

## 実行
```
$ git submodule update --init --recursive
$ docker-compose up -d
```

### シミュレータ
```
$ docker ps -a # simulator の Container ID を確認
$ docker exec -it <CONTAINER_ID> /bin/bash
# cd ~/aobc-sils/s2e/
# ./build/S2E_AOBC #S2E実行
```
http://localhost:8900/devtools/ からテレコマを確認

## ブランチ
`main`を最新版とする．
項目ごとに`feature/**`で開発し，`main`にPull Requestを送る．