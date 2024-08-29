# World Explorer

World Explorer is a GUI tool designed for visually exploring and manipulating the state of worlds.
For the full information about it, [see the docs](http://mud.dev/world-explorer).

## Installation

Starting with MUD 2.2, the MUD templates come with the World Explorer installed. See [Getting started](https://mud.dev/quickstart) guide for MUD for more information. 

If you have an existing MUD project you'd like to use World Explorer for, you can create a project with the new template and then use World Explorer from that project with your existing one:

1. Create a project with the new template, which has World Explorer. Then, delete the files you no longer need.

   ```sh copy
   pnpm create mud@main explorer --template vanilla
   cd explorer
   rm -rf packages/client packages/contracts
   ```

2. Edit `mprocs.yaml` to remove the definitions for `client`, `contracts`, and `anvil`.

   ```yaml filename="mprocs.yaml" copy
   procs:
     indexer:
       cwd: packages/contracts
       shell: rimraf $SQLITE_FILENAME && pnpm sqlite-indexer
       env:
         RPC_HTTP_URL: "http://127.0.0.1:8545"
         FOLLOW_BLOCK_TAG: "latest"
         SQLITE_FILENAME: "indexer.db"
     explorer:
       cwd: packages/contracts
       shell: pnpm explorer
   ```

3. Replace `packages/contracts/worlds.json` with a link to the original project's `worlds.json`.

   ```sh copy
   cp packages/contracts
   rm worlds.json
   ln -s <the original project>/packages/contracts/worlds.json .
   cd ../..
   ```

4. Run the new project.

   ```sh copy
   pnpm dev
   ```

5. Browse to [World Explorer](http://localhost:13690).

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
