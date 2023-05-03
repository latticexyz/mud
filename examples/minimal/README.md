# Minimal MUD example project with multiple clients

This example project demonstrates how to use the MUD framework to create a simple on-chain application. It includes several client types that you can pick from to run the app or get inspiration from, all using the same underlying smart contracts.

## Getting started
1. Since this project uses local MUD dependencies, you need to prepare them first by running this command in the MUD root directory: `pnpm install && pnpm build`
2. To start the development environment of this project, run `pnpm dev` in the project root. This will start a local chain, deploy the contracts in `packages/contracts`, and start a development server for the client. By default the react client (`packages/client-react`) will be used. To use the vanilla client instead, run `pnpm dev:client-vanilla`.
3. Open [localhost:3000](http://localhost:3000) in your browser.
