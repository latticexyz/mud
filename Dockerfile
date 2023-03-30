FROM node:18

RUN apt-get update && apt-get install -y \
    python2-minimal \
    golang-go \
    jq \
    time \
    curl \
    openssh-client \
    && curl -L https://foundry.paradigm.xyz | bash \
    && . /root/.bashrc \
    && foundryup
    
RUN npm install -g lerna

WORKDIR /root/app

COPY . .

CMD ["time", "lerna", "exec", "--", "yarn", "pack", "--dry-run"]