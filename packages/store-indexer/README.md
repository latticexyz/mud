# store-indexer

A minimal Typescript indexer for Store events (built on [store-sync](https://npmjs.com/package/@latticexyz/store-sync))

## Usage

Install and run with:

```sh
npm install @latticexyz/store-indexer

npm sqlite-indexer
# or
npm postgres-indexer
```

or execute the one of the package bins directly:

```sh
npx -p @latticexyz/store-indexer sqlite-indexer
# or
npx -p @latticexyz/store-indexer postgres-indexer
```

## Configuration

Each indexer can be configured with environment variables.

### Common environment variables

| Variable           | Description                                                | Default   |
| ------------------ | ---------------------------------------------------------- | --------- |
| `HOST`             | Host that the indexer server listens on                    | `0.0.0.0` |
| `PORT`             | Port that the indexer server listens on                    | `3001`    |
| `RPC_HTTP_URL`     | HTTP URL for Ethereum RPC to fetch data from               |           |
| `RPC_WS_URL`       | WebSocket URL for Ethereum RPC to fetch data from          |           |
| `START_BLOCK`      | Block number to start indexing from                        | `0`       |
| `MAX_BLOCK_RANGE`  | Maximum number of blocks to fetch from the RPC per request | `1000`    |
| `POLLING_INTERVAL` | How often to poll for new blocks (in milliseconds)         | `1000`    |

Note that you only need one of `RPC_HTTP_URL` or `RPC_WS_URL`, but we recommend both. The WebSocket URL will be prioritized and fall back to the HTTP URL if there are any connection issues.

### Postgres indexer environment variables

| Variable       | Description             | Default |
| -------------- | ----------------------- | ------- |
| `DATABASE_URL` | Postgres connection URL |         |

### SQLite indexer environment variables

| Variable          | Description              | Default      |
| ----------------- | ------------------------ | ------------ |
| `SQLITE_FILENAME` | SQLite database filename | `indexer.db` |
