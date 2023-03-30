FROM node:18

RUN apt-get update && apt-get install -y \
    python2-minimal \
    golang-go \
    time \
    curl \
    openssh-client \
    && curl -L https://foundry.paradigm.xyz | bash \
    && . /root/.bashrc \
    && foundryup 

WORKDIR /root/app

COPY . .

CMD ["time", "yarn", "pack", "--dry-run"]