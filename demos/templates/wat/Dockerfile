FROM ubuntu:24.04

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl tar ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://github.com/WebAssembly/wabt/releases/download/1.0.36/wabt-1.0.36-ubuntu-20.04.tar.gz \
    -o /tmp/wabt.tar.gz && \
    tar xzf /tmp/wabt.tar.gz -C /opt && \
    rm /tmp/wabt.tar.gz

ENV PATH="/opt/wabt-1.0.36/bin:${PATH}"
