FROM rust:latest

RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash
RUN cargo binstall --root . kble     --version 0.4.0 --no-confirm --force
RUN cargo binstall --root . kble-c2a        --version 0.4.0 --no-confirm --force
RUN cargo binstall --root . kble-eb90       --version 0.4.0 --no-confirm --force
RUN cargo install --git https://github.com/CertainLach/jrsonnet jrsonnet

WORKDIR /kble/
COPY kble/connection.jsonnet ./

CMD bash -c 'while :; do kble -s <(jrsonnet connection.jsonnet); sleep 1; done'
