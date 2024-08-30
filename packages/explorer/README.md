# World Explorer

World Explorer is a GUI tool designed for visually exploring and manipulating the state of worlds.
For the full information about it, [see the official docs](http://mud.dev/world-explorer).

## Getting started

### Prerequisites

World Explorer is not intended to be used alone, and includes the following prerequisites:

- [MUD project](https://mud.dev/introduction)
- [anvil development chain](https://book.getfoundry.sh/anvil/)
- [@latticexyz/store-indexer](https://www.npmjs.com/package/@latticexyz/store-indexer)

### Install and run

```sh
pnpm add @latticexyz/explorer
pnpm explorer
```

Or, can be executed with a package bin directly:

```sh
npx @latticexyz/explorer
```

**Note:** `worlds.json` is the default file used to configure the world. If you're using a different file or if the file is located in a different path than where you're running the command, you can specify it with the `--worldsFile` flag, or use `--worldAddress` to point to the world address directly. Accordingly, `indexer.db` is the default database file used to index the world state. If you're using a different database file or if the file is located in a different path than where you're running the command, you can specify it with the `--indexerDatabase` flag.

### Example setup

For a full working setup, check out the [local-explorer](https://github.com/latticexyz/mud/tree/main/examples/local-explorer) example.

You may also want to check out the MUD [Quickstart guide](https://mud.dev/quickstart) to set up a new MUD template project that already comes with the World Explorer included, along with all the prerequisites.

## CLI arguments

The World Explorer accepts the following CLI arguments:

| Argument          | Description                                                         | Default value      |
| ----------------- | ------------------------------------------------------------------- | ------------------ |
| `worldAddress`    | The address of the world to explore                                 | None               |
| `worldsFile`      | Path to a worlds configuration file (used to resolve world address) | "worlds.json"      |
| `indexerDatabase` | Path to your SQLite indexer database                                | "indexer.db"       |
| `chainId`         | The chain ID of the network                                         | 31337              |
| `port`            | The port on which to run the World Explorer                         | 13690              |
| `dev`             | Flag to run the World Explorer in development mode                  | false (production) |

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

3. **Run**

   ```sh
   pnpm dev
   ```

   Files can now be edited in the `packages/explorer` directory, and changes will be reflected in the running World Explorer instance.

## Links

- [Official World Explorer docs](https://mud.dev/world-explorer)
