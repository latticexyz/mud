# World Explorer

World Explorer is a GUI tool designed for visually exploring and manipulating the state of worlds.
For the full information about it, [see the docs](http://mud.dev/world-explorer).

## Getting started

### Prerequisites

World Explorer is not intended to be used alone, and includes the following prerequisites to be set up and running:

- MUD project
- Development chain (e.g. Hardhat, Foundry)
- [@latticexyz/store-indexer](https://www.npmjs.com/package/@latticexyz/store-indexer)

### Installation

```sh
pnpm add @latticexyz/explorer
pnpm explorer
```

Or, can be executed with a package bin directly:

```sh
npx @latticexyz/explorer
```

### Example setup

For a full working setup, check out the [`local-explorer` example](https://github.com/latticexyz/mud/tree/main/examples/local-explorer).

## CLI arguments

The World Explorer accepts the following CLI arguments:

| Argument          | Description                                                                      | Default value |
| ----------------- | -------------------------------------------------------------------------------- | ------------- |
| `worldAddress`    | The address of the world to explore                                              | None          |
| `worldsFile`      | Path to a worlds configuration file (used to resolve world address)              | "worlds.json" |
| `indexerDatabase` | Path to your SQLite indexer database                                             | "indexer.db"  |
| `chainId`         | The chain ID of the network                                                      | 31337         |
| `port`            | The port on which to run the World Explorer                                      | 13690         |
| `env`             | The environment to run the World Explorer in (e.g., "development", "production") | "production"  |

## Contributing

To contribute to World Explorer, first get familiar with the [MUD contribution guidelines](https://mud.dev/contribute). Then, set up the development environment for World Explorer:

1. **Clone MUD**

   ```sh
   git clone git@github.com:latticexyz/mud.git
   cd mud
   pnpm install
   pnpm build
   ```

2. **Setup**

   Navigate to the `examples/local-explorer` and install dependencies.

   ```sh
   cd examples/local-explorer
   pnpm install
   ```

3. **Configure**

   In `mprocs.yaml`, ensure the `explorer` command is set to run the World Explorer in `development` mode.

   ```yaml
   explorer:
     shell: pnpm explorer --env development
   ```

4. **Run**

   ```sh
   pnpm dev
   ```

   Files can now be edited in the `packages/explorer` directory, and changes will be reflected in the running World Explorer instance.

## Links

- [Official World Explorer docs](https://mud.dev/world-explorer)
