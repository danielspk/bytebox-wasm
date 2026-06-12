FROM alpine:3.24

RUN apk add --no-cache lld && \
    wget -q https://github.com/odin-lang/Odin/releases/download/dev-2026-06/odin-linux-amd64-dev-2026-06.tar.gz -O /tmp/odin.tar.gz && \
    mkdir -p /opt/odin && \
    tar xzf /tmp/odin.tar.gz -C /opt/odin --strip-components=1 && \
    rm /tmp/odin.tar.gz

ENV PATH="/opt/odin:${PATH}"
