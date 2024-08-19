# Explorer

Explorer is a GUI tool designed for visually exploring and manipulating the state of worlds.

## Getting started

1. **Install the package**

   ```sh
   pnpm add @latticexyz/explorer
   ```

2. **Start a local development chain**

   Ensure you have a local development chain running.

3. **Configure indexer database**

   Set `INDEXER_DB_PATH` environment variable to point to your SQLite indexer database.
   Note: You can use `@latticexyz/store-indexer` for indexing your world's data.

4. **Run the explorer**

   ```sh
   npx @latticexyz/explorer
   ```

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

   Navigate to the `examples/local-explorer` directory and set the explorer mode to `development` in `mprocs.yaml`:

   ```yaml
   explorer:
     shell: node explorer-watcher.mjs
     env:
       PORT: "13690"
       CHAIN_ID: "31337"
       MODE: "development"
   ```

2. **Run**

   ```sh
   pnpm dev
   ```

   Files can now be edited in the `packages/explorer` directory, and changes will be reflected in the running explorer instance.
