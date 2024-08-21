# Explorer

Explorer is a GUI tool designed for visually exploring and manipulating the state of worlds.

## Getting started

1. **Install the package**

   ```sh
   pnpm add @latticexyz/explorer
   ```

2. **Start a local development chain**

   Ensure you have a local development chain running.

3. **Run the explorer**

   ```sh
   npx @latticexyz/explorer --worldAddress <YOUR_WORLD_ADDRESS>
   ```

   Alternatively, if you have a worlds configuration file:

   ```sh
   npx @latticexyz/explorer --worldsConfigPath <PATH_TO_WORLDS_CONFIG>
   ```

   Note: You can use `@latticexyz/store-indexer` for indexing your world's data.

## CLI arguments

The explorer accepts the following CLI arguments:

| Argument          | Description                                                                | Default value |
| ----------------- | -------------------------------------------------------------------------- | ------------- |
| `worldAddress`    | The address of the world to explore                                        | None          |
| `worldsFile`      | Path to a worlds configuration file (used to resolve world address)        | None          |
| `indexerDatabase` | Path to your SQLite indexer database                                       | "indexer.db"  |
| `chainId`         | The chain ID of the network                                                | 31337         |
| `port`            | The port on which to run the explorer                                      | 13690         |
| `env`             | The environment to run the explorer in (e.g., "development", "production") | "production"  |

## Example setup

An example setup is provided in the `examples/local-explorer` directory, demonstrating a full setup for using the explorer in a local development environment:

1. **Setup**

   ```sh
   cd examples/local-explorer && pnpm install
   ```

2. **Run**

   ```sh
   pnpm dev
   ```

   This command starts all necessary processes, including a local chain, indexer, and the explorer.

## Contributing

To contribute to or modify the explorer, the easiest way is to run the example setup in `development` mode:

1. **Setup**

   Navigate to the `examples/local-explorer` directory and locate the `mprocs.yaml` file.

2. **Configure**

   In `mprocs.yaml`, ensure the explorer command is set up correctly. For example:

   ```yaml
   explorer:
     shell: pnpm explorer --worldsConfigPath packages/contracts/worlds.json --env development
   ```

3. **Run**

   ```sh
   pnpm dev
   ```

   Files can now be edited in the `packages/explorer` directory, and changes will be reflected in the running explorer instance.
