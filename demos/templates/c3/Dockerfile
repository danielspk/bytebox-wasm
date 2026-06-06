FROM alpine:latest

RUN wget -q https://github.com/c3lang/c3c/releases/download/v0.8.0_3/c3-linux-static.tar.gz -O /tmp/c3.tar.gz && \
    tar xzf /tmp/c3.tar.gz -C /tmp && \
    mv /tmp/c3/c3c /usr/local/bin/c3c && \
    mkdir -p /usr/local/lib/c3 && \
    mv /tmp/c3/lib/* /usr/local/lib/c3/ && \
    rm -rf /tmp/c3.tar.gz /tmp/c3

ENV C3C_LIB=/usr/local/lib/c3
