# Getting started

## Quickstart

Let's create our first MUD project!
Run the following command in the console of your choice to create a new MUD project in `my-project` using the minimal template.

```
npx mud create my-project --template minimal
```

Next, run `yarn dev` in the root directory of your new project to start the development server (client and local Ethereum node).

```
yarn dev
```

## What is happening here

The minimal MUD project template is organized as a yarn monorepo.
You can find the contract code in `packages/contracts` and the client code in `packages/client`.

### Contracts

#### Setup

- organized as forge compatible solidity project
- component definitions in `src/components`
  - ID is part of the file
- systems in `src/systems`
  - ID is part of the file
- libraries in `src/components`
- test files in `src/test`

- `deploy.json` contains the deployment configuration (which components to deploy, which systems to deploy, which systems to give write access to which components)

  - In the background creates a deploy script based on `deploy.json` when calling `deploy-contracts` (as part of `yarn dev` and `yarn deploy`)

- `yarn devnode` starts a development node
- `yarn dev` deploys the contracts to the local node and sets up a watcher to redeploy relevant systems when you change the source files
- `yarn deploy` deploys the contracts to any EVM compatible chain (requires some params)

#### Example

- CounterComponent, IncrementSystem, LibMath as examples
- Call IncrementSystem to increment counter
- Modify IncrementSystem or LibMath to redeploy contracts

### Client

- Minimal setup, mostly for demonstration purposes (for a more useful client setup, checkout mud-template-react)
- Have a look at index.ts
- When contracts are deployed, MUD automatically generates System types -> imported from `components/types`
- A world is set up on the client
- A component is set up on the client -> linked to the contract component by giving it the same ID
- Setting up network code `setupMUDNetwork`: passing config, world, components, types - that;s all

### Demo

When pressing the button, the system is called, the on-chain component is modified, the component state is synchronized to the client.

When modifying the library imported in the system, or the system itself, the contracts are redeployed (and the state is kept)
