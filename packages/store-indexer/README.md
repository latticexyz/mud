# store-indexer

A minimal Typescript indexer for [MUD Store](https://mud.dev/store) events (built on [store-sync](https://npmjs.com/package/@latticexyz/store-sync))

## Usage

Install and run with:

```sh
npm install @latticexyz/store-indexer

npm sqlite-indexer
# or
npm postgres-indexer & npm postgres-frontend
```

or execute the one of the package bins directly:

```sh
npx -p @latticexyz/store-indexer sqlite-indexer
# or
npx -p @latticexyz/store-indexer postgres-indexer & npx -p @latticexyz/store-indexer postgres-frontend
```

## Configuration

Each indexer can be configured with environment variables.

### Common environment variables for indexer

| Variable           | Description                                                                                                   | Default |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ------- |
| `RPC_HTTP_URL`     | HTTP URL for Ethereum RPC to fetch data from                                                                  |         |
| `RPC_WS_URL`       | WebSocket URL for Ethereum RPC to fetch data from                                                             |         |
| `START_BLOCK`      | Block number to start indexing from                                                                           | `0`     |
| `MAX_BLOCK_RANGE`  | Maximum number of blocks to fetch from the RPC per request                                                    | `1000`  |
| `POLLING_INTERVAL` | How often to poll for new blocks (in milliseconds)                                                            | `1000`  |
| `STORE_ADDRESS`    | Optional address of the MUD Store to index. By default, store-indexer will index all MUD Stores on the chain. |         |

Note that you only need one of `RPC_HTTP_URL` or `RPC_WS_URL`, but we recommend both. The WebSocket URL will be prioritized and fall back to the HTTP URL if there are any connection issues.

### Common environment variables for frontend

| Variable | Description                                      | Default   |
| -------- | ------------------------------------------------ | --------- |
| `HOST`   | Host that the indexer frontend server listens on | `0.0.0.0` |
| `PORT`   | Port that the indexer frontend server listens on | `3001`    |

### Postgres indexer environment variables

| Variable           | Description                                         | Default |
| ------------------ | --------------------------------------------------- | ------- |
| `DATABASE_URL`     | Postgres connection URL                             |         |
| `HEALTHCHECK_HOST` | Host that the indexer healthcheck server listens on |         |
| `HEATHCHECK_PORT`  | Port that the indexer healthcheck server listens on |         |

### SQLite indexer environment variables

| Variable          | Description              | Default      |
| ----------------- | ------------------------ | ------------ |
| `SQLITE_FILENAME` | SQLite database filename | `indexer.db` |
