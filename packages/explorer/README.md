# World Explorer

World Explorer is a GUI tool designed for visually exploring and manipulating the state of worlds.
For the full information about it, [see the docs](http://mud.dev/world-explorer).

## Installation

Starting with MUD 2.2, the MUD templates come with the World Explorer installed.
These instructions are how to use World Explorer on earlier versions of MUD.

The easiest way to get World Explorer for earlier MUD versions is to create a project with the new template.

1. [Create a project with the new template](https://mud.dev/quickstart), which has World Explorer.
   Then, delete the files you no longer need.

   ```sh copy
   pnpm create mud@main explorer --template vanilla
   cd explorer
   rm -rf packages/client packages/contracts/[st]*
   ```

1. Edit `mprocs.yaml` to remove the definitions for `client`, `contracts`, and `anvil`.

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

1. Replace `packages/contracts/worlds.json` with a link to the original project's `worlds.json`.

   ```sh copy
   cp packages/contracts
   rm worlds.json
   ln -s <the original project>/packages/contracts/worlds.json .
   cd ../..
   ```

1. Run the new project.

   ```sh copy
   pnpm dev
   ```

1. Browse to [World Explorer](http://localhost:13690).

### CLI arguments

To use the explorer with different command-line options, use this process:

1. In the mprocs screen, go down to the **explorer** process.

1. Type `x` to stop the default explorer.

1. In a different command-line window, go to `packages/contract`.

1. Run the explorer using `pnpm explorer <options>`.

The World Explorer accepts the following CLI options:

| Option              | Description                                                                      | Default value |
| ------------------- | -------------------------------------------------------------------------------- | ------------- |
| `--worldAddress`    | The address of the world to explore                                              | None          |
| `--worldsFile`      | Path to a worlds configuration file (used to resolve world address)              | None          |
| `--indexerDatabase` | Path to your SQLite indexer database                                             | indexer.db    |
| `--chainId`         | The chain ID of the network                                                      | 31337         |
| `--port`            | The port on which to run the World Explorer                                      | 13690         |
| `--env`             | The environment to run the World Explorer in (e.g., "development", "production") | production    |
