---
"@latticexyz/store-indexer": minor
---

You can now install and run `@latticexyz/store-indexer` from the npm package itself, without having to clone/build the MUD repo:

```sh
npm install @latticexyz/store-indexer

npm sqlite-indexer
# or
npm postgres-indexer
```

or

```sh
npx -p @latticexyz/store-indexer sqlite-indexer
# or
npx -p @latticexyz/store-indexer postgres-indexer
```

The binary will also load the nearby `.env` file for easier local configuration.

We've removed the `CHAIN_ID` requirement and instead require just a `RPC_HTTP_URL` or `RPC_WS_URL` or both. You can now also adjust the polling interval with `POLLING_INTERVAL` (defaults to 1000ms, which corresponds to MUD's default block time).
