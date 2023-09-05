FROM docker.io/library/debian:bullseye-slim as base
ENV SHELL /bin/bash

WORKDIR /opt
RUN apt-get -y update --fix-missing && \
    apt-get -y upgrade && \
    apt-get install -y --no-install-recommends \
    libssl-dev make cmake graphviz \
    git pkg-config curl time rhash ca-certificates jq \
    python3 python3-pip lsof ruby ruby-bundler git-restore-mtime xz-utils zstd unzip gnupg protobuf-compiler \
    wget net-tools iptables iproute2 iputils-ping ed zlib1g-dev wabt

# node.js
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    node --version && \
    npm --version

# go
RUN wget https://dl.google.com/go/go1.20.4.linux-amd64.tar.gz && \
    # -C to move to given directory
    tar -C /usr/local/ -xzf go1.20.4.linux-amd64.tar.gz

# foundry
RUN curl -L https://foundry.paradigm.xyz/ | bash && \
    ${HOME}/.foundry/bin/foundryup && \
    forge --version && \
    cast --version && \
    anvil --version && \
    chisel --version

# pnpm
RUN npm install pnpm --global && pnpm --version

FROM base AS builder
COPY . /app
WORKDIR /app

ENV PATH="${PATH}:/usr/local/go/bin"
ENV PATH="${PATH}:/root/.foundry/bin"
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

FROM builder AS store-indexer
WORKDIR /app/packages/store-indexer
EXPOSE 3001