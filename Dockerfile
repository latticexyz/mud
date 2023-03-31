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

# Use lerna to generate the versions that would be published
# Note: doesn't actually build and publish the project
CMD ["lerna", "version", "--no-git-tag-version", "--no-push"]
