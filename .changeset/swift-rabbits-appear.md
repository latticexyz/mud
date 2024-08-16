---
"@latticexyz/explorer": patch
---

Initial release of the @latticexyz/explorer package. Explorer is a standalone tool designed to explore and manage worlds. This initial release supports local worlds, with plans to extend support to any world in the future.

## Using explorer

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

   This command starts all necessary processes, including a local chain, indexer, and the Explorer.

## Contributing

To contribute to or modify the explorer, the easiest way is to run the example setup via `development` mode:

1. **Setup the example**
   Navigate to the `examples/local-explorer` directory and set the explorer mode to `development` in `mprocs.yaml`:

   ```yaml
   explorer:
     shell: node explorer-watcher.mjs
     env:
       PORT: "13690"
       CHAIN_ID: "31337"
       MODE: "development"
   ```

   Then run the example setup:

   ```sh
   pnpm dev
   ```

2. **Make changes**
   Edit files in the `packages/explorer` directory. Changes will be reflected in the running explorer instance.

3. **Submit changes**
   Commit the changes, and create a pull request with your improvements.
