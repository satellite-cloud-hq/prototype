# プロトタイプ

# 開発

## 実行
(3まで初回のみ)
1. Docker Desktop の Kubernetes を有効にする
    - Docker Desktop を起動
    - 右上の歯車（⚙）→「Kubernetes」タブをクリック
    - 「Kubernetes を有効にする（Enable Kubernetes）」にチェック
    - 「Apply & Restart」をクリックして反映
    - 数分待つとクラスターが自動で起動
2. クラスター接続を確認する
    ```
    $ kubectl config current-context
    docker-desktop
    ```
    となればOK
3. docker buildする(とりあえず. 今後は組織で一つにした方が良さそう)
    ```
    $ git submodule update --init --recursive
    $ cd campaign
    $ docker compose build

    $ cd ..
    $ docker compose build
    ```
(ここから毎回)
4. helmインストールをする
    ```
    $ cd helm-root
    $ helm install satellite-cloud .
    $ kubectl port-forward service/api-server 8000:8000
    ```
    2回目以降は
    ```
    $ helm upgrade --install satellite-cloud .
    $ kubectl port-forward service/api-server 8000:8000
    ```

http://localhost:30002/ からwebconsoleを確認

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