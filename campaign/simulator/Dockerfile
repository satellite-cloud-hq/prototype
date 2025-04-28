FROM --platform=linux/x86_64 ubuntu:latest

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
    g++-multilib

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

CMD ["./build/S2E_AOBC"]
