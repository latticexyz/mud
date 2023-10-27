# faucet

A minimal Typescript faucet to drip native tokens on Ethereum chains

## Usage

Install and run with:

```sh
npm install @latticexyz/faucet@next
npm faucet-server
```

or execute the package bin directly:

```sh
npx @latticexyz/faucet@next
```

## Configuration

The faucet can configured with the following environment variables:

| Variable             | Description                                           | Default   |
| -------------------- | ----------------------------------------------------- | --------- |
| `HOST`               | Host that the indexer server listens on               | `0.0.0.0` |
| `PORT`               | Port that the indexer server listens on               | `3002`    |
| `RPC_HTTP_URL`       | HTTP URL for Ethereum RPC                             |           |
| `FAUCET_PRIVATE_KEY` | Private key of wallet to distribute faucet funds from |           |
| `DRIP_AMOUNT_ETHER`  | Drip amount in ether                                  |
