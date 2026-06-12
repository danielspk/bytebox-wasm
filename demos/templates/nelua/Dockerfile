FROM ghcr.io/webassembly/wasi-sdk:wasi-sdk-33

ENV WASI_SDK_PATH=/opt/wasi-sdk

RUN apt-get update && \
    apt-get install -y --no-install-recommends git build-essential ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://github.com/edubart/nelua-lang.git /tmp/nelua && \
    make -C /tmp/nelua && \
    make -C /tmp/nelua install PREFIX=/usr/local && \
    rm -rf /tmp/nelua
