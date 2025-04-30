# Generate satconfig
FROM node:latest AS satconfig-builder

WORKDIR /c2a-aobc/
COPY aobc-sils/c2a-aobc/ ./

RUN npm install .


# Generate tlmcmddb
FROM rust:latest AS tlmcmddb-builder

WORKDIR /c2a-aobc/
COPY aobc-sils/c2a-aobc/ ./

RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash
RUN cargo binstall --root . tlmcmddb-cli    --version 2.6.1 --no-confirm --force
RUN ./bin/tlmcmddb-cli bundle --component-name AOBC --pretty database/TLM_DB/calced_data database/CMD_DB tlmcmddb.json


# Run tmtc
FROM rust:latest AS runtime

RUN apt update && \
    apt install -y --no-install-recommends \
    protobuf-compiler \
    libprotobuf-dev \
    libssl-dev \
    pkg-config

# 依存ライブラリのみビルド
WORKDIR /tmtc
COPY tlmcmd-bridge/Cargo.toml tlmcmd-bridge/Cargo.lock ./
RUN mkdir src \
    && echo 'fn main() {println!("dummy");}' > src/main.rs \
    && cargo build --release \
    && rm -rf src

# ビルド
COPY tlmcmd-bridge/ ../tmtc/
RUN cargo install --path .

COPY --from=satconfig-builder /c2a-aobc/satconfig.json satconfig.json
COPY --from=tlmcmddb-builder /c2a-aobc/tlmcmddb.json tlmcmddb.json

CMD tmtc_c2a --campaign-id ${CAMPAIGN_ID} \
    --campaign-start-timestamp-ms ${CAMPAIGN_START_TIMESTAMP_MS} \
    --satconfig satconfig.json --tlmcmddb tlmcmddb.json