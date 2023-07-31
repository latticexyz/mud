FROM docker.io/library/debian:bullseye-slim as base
ENV SHELL /bin/bash

WORKDIR /opt
RUN apt-get -y update --fix-missing && \
    apt-get -y upgrade && \
    apt-get install -y --no-install-recommends \
    libssl-dev make cmake graphviz \
    git pkg-config curl time rhash ca-certificates jq \
    python3 python3-pip lsof ruby ruby-bundler git-restore-mtime xz-utils zstd unzip gnupg protobuf-compiler && \
    apt-get install -y vim wget net-tools iptables iproute2 iputils-ping ed && \
    apt-get -y update; \
    apt-get install -y --no-install-recommends zlib1g-dev npm wabt && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    # install Go
    wget https://dl.google.com/go/go1.20.4.linux-amd64.tar.gz && \
    # -C to move to given directory
    tar -C /usr/local/ -xzf go1.20.4.linux-amd64.tar.gz && \
    npm install pnpm --global

ENV PATH="${PATH}:/usr/local/go/bin"


FROM base AS builder
COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
ENV PATH="${PATH}:/usr/local/go/bin"
ENV PATH="${PATH}:${HOME}/.foundry"

FROM builder AS store-indexer
WORKDIR /app/packages/store-indexer
EXPOSE 3001
ENV DEBUG=*
ENV NODE_ENV=production
CMD [ "pnpm", "start:testnet" ]