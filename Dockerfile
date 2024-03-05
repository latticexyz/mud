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
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    node --version && \
    npm --version

# foundry
ENV PATH="${PATH}:/root/.foundry/bin"
RUN curl -L https://foundry.paradigm.xyz/ | bash && \
    ${HOME}/.foundry/bin/foundryup && \
    forge --version && \
    cast --version && \
    anvil --version && \
    chisel --version

# pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN npm install pnpm --global && pnpm --version

FROM base AS mud
COPY . /app
WORKDIR /app

# pnpm no longer runs prepare before the actual install (https://github.com/pnpm/pnpm/issues/3760)
# but we need to create some placeholder files like bins so that the install step can find them and put references to them in the right spot
# this resolves some chicken-and-egg problems with using workspace bins before they're created (install -> build -> install)
RUN pnpm recursive run prepare
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

FROM mud AS store-indexer
WORKDIR /app/packages/store-indexer
EXPOSE 3001

FROM mud AS faucet
WORKDIR /app/packages/faucet
EXPOSE 3002
