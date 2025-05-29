FROM mcr.microsoft.com/devcontainers/typescript-node:1-18-bookworm

ENV HOME /home/node

# foundry
ENV PATH $PATH:$HOME/.foundry/bin
RUN curl -L https://foundry.paradigm.xyz/ | bash && \
    ${HOME}/.foundry/bin/foundryup && \
    forge --version && \
    cast --version && \
    anvil --version && \
    chisel --version

# pnpm
ENV PNPM_HOME $HOME/.local/share/pnpm
RUN pnpm config set store-dir ${PNPM_HOME}/store
