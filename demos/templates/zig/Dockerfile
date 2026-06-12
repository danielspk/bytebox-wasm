FROM alpine:3.24

RUN apk add --no-cache xz && \
    wget -q https://ziglang.org/download/0.16.0/zig-x86_64-linux-0.16.0.tar.xz -O /tmp/zig.tar.xz && \
    mkdir -p /opt/zig && \
    xz -dc /tmp/zig.tar.xz | tar x -C /opt/zig --strip-components=1 && \
    rm /tmp/zig.tar.xz

ENV PATH="/opt/zig:${PATH}"
