# production ready dockerfile that runs pnpm start
FROM node:20-alpine

# set working directory
WORKDIR /app

# install pnpm
RUN npm install -g pnpm

# copy package.json
COPY package.json tsconfig.json ./

# copy source code
COPY ./src ./src

# install dependencies
RUN pnpm fetch
RUN pnpm install

RUN pnpm build

# start app
CMD ["pnpm", "start"]
