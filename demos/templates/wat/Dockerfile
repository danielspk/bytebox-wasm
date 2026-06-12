FROM alpine:3.24

RUN apk add --no-cache gcompat libstdc++ && \
    wget -q https://github.com/WebAssembly/wabt/releases/download/1.0.41/wabt-1.0.41-linux-x64.tar.gz -O /tmp/wabt.tar.gz && \
    tar xzf /tmp/wabt.tar.gz -C /opt && \
    rm /tmp/wabt.tar.gz

ENV PATH="/opt/wabt-1.0.41/bin:${PATH}"
