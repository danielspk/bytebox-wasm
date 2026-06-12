FROM alpine:3.24

RUN apk add --no-cache xz lld && \
    wget -q https://github.com/ldc-developers/ldc/releases/download/v1.42.0/ldc2-1.42.0-alpine-x86_64.tar.xz -O /tmp/ldc.tar.xz && \
    xz -dc /tmp/ldc.tar.xz | tar x -C /opt && \
    rm /tmp/ldc.tar.xz

ENV PATH="/opt/ldc2-1.42.0-alpine-x86_64/bin:${PATH}"
