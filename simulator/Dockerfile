FROM --platform=linux/x86_64 ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive
ARG NODE_VERSION=20

# Tools
RUN apt update --fix-missing && \
    apt install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    gcc-multilib \
    protobuf-compiler \
    libclang-dev \
    make \
    cmake \
    g++ \
    g++-multilib \
    python3 \
    python3-pip \
    python3-venv \
    build-essential

# Use bash for the shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Create a script file sourced by both interactive and non-interactive bash shells
ENV BASH_ENV /root/.bash_env
RUN touch "${BASH_ENV}"
RUN echo '. "${BASH_ENV}"' >> ~/.bashrc

# Download and install nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | PROFILE="${BASH_ENV}" bash
RUN echo node > .nvmrc
RUN nvm install node
RUN npm install --global yarn

# Rustup
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sed 's#/proc/self/exe#\/bin\/sh#g' | sh -s -- -y
ENV PATH $PATH:/root/.cargo/bin
RUN rustup target add i686-unknown-linux-gnu

# S2E
COPY /aobc-sils /root/aobc-sils

WORKDIR /root/aobc-sils/s2e
RUN mkdir s2e-aobc/ExtLibraries
RUN bash s2e_initial_setup.sh

RUN cmake -B build -DUSE_KBLE_MOBC_UART=ON
RUN cmake --build build -j

WORKDIR /root/aobc-sils/c2a-aobc
RUN npm install .

# CMD npm run devtools:sils

# Runner
WORKDIR /root/
COPY /requirements.txt .

RUN python3 -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
ENV PATH="/opt/venv/bin:$PATH"

COPY /runner_api.py .

# FastAPIサーバーを起動
CMD ["uvicorn", "runner_api:app", "--host", "0.0.0.0", "--port", "80", "--reload"]