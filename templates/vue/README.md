# mud-template-vue

## Project Overview

`mud-template-vue` is a rapid start template for MUD application development with Vue3. The purpose of this template is to provide developers with a simple and efficient way to start developing MUD applications using Vue3

## Environment Setup

Before starting to use `mud-template-vue`, make sure the following tools are installed on your system:

### Node.js

`mud-template-vue` requires a Node.js environment. Please visit the [Node.js official website](https://nodejs.org/), download, and install the latest stable version suitable for your operating system.

### Foundry

Foundry is a development and testing framework for smart contracts. Although it is primarily used for Ethereum smart contract development, it may be used in some projects as well. You can install Foundry by executing the following command:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

For more details, please refer to the Foundry official website.

### pnpm

`mud-template-vue` uses pnpm as the package manager to efficiently handle project dependencies. Install pnpm with the following command:

```bash
npm install -g pnpm
```

## Quick Start

### Installing Project Dependencies

After cloning or downloading `mud-template-vue` to your local environment, execute the following command in the project's root directory to install all necessary dependencies:

```bash
pnpm i
```

### Starting the Development Server

Once the dependencies are installed, compile the project and start the development server with the following command:

```bash
pnpm dev
```

### Accessing Your Application

After the development server starts, your MUD application will, by default, run on [http://localhost:3000/](http://localhost:3000/). Open your browser and visit this address to see your MUD application running. You can now directly start developing your MUD application in `packages/client` using Vue quickly.

## Contributions

We welcome any form of contribution, whether it be feature suggestions, code submissions, or documentation improvements. Please share your ideas with us through GitHub Issues or Pull Requests.

## License

This project is licensed under the MIT License. For more details, please refer to the `LICENSE` file.
