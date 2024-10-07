# @latticexyz/explorer

## 2.2.11

### Patch Changes

- bbd5e31: Observe tab is now populated by transactions flowing through the world, in addition to local transactions when using the `observer` transport wrapper.
- 645b7e0: Fixed row expansion in the transactions table where an incorrect row would expand when new transactions appeared.
- 85bbeb8: It is now possible to pass in environment variables like `RPC_HTTP_URL` to the internal local indexer when running the explorer locally.
- 71eb348: Observe tab is now populated by rejected transactions coming from the `observer` transport wrapper.
- Updated dependencies [7ddcf64]
- Updated dependencies [61930ee]
- Updated dependencies [13e5689]
- Updated dependencies [7ddcf64]
  - @latticexyz/store@2.2.11
  - @latticexyz/store-sync@2.2.11
  - @latticexyz/common@2.2.11
  - @latticexyz/store-indexer@2.2.11
  - @latticexyz/world@2.2.11
  - @latticexyz/config@2.2.11
  - @latticexyz/protocol-parser@2.2.11
  - @latticexyz/schema-type@2.2.11

## 2.2.10

### Patch Changes

- e39afda: Fixed table name construction in the explorer query for root tables for SQLite.
- 8858e52: - Tables can be searched by specific values.
  - Improved handling of dynamic SQL queries.
  - The "Connect" modal is triggered during a write action if the wallet is not connected.
  - Toast messages are now dismissible.
- Updated dependencies [9d7fc85]
  - @latticexyz/world@2.2.10
  - @latticexyz/store-sync@2.2.10
  - @latticexyz/store-indexer@2.2.10
  - @latticexyz/common@2.2.10
  - @latticexyz/config@2.2.10
  - @latticexyz/protocol-parser@2.2.10
  - @latticexyz/schema-type@2.2.10
  - @latticexyz/store@2.2.10

## 2.2.9

### Patch Changes

- 2f2e63a: Exploring worlds on Redstone and Garnet chains will now retrieve data from the hosted SQL indexer.
- 95aa3bb: Explorer now automatically starts a local indexer when using Anvil as the target chain.

  If you previously had an `indexer` entry in your `mprocs.yaml` file, it can now be removed.

  ```diff
  -  indexer:
  -    cwd: packages/contracts
  -    shell: shx rm -rf $SQLITE_FILENAME && pnpm sqlite-indexer
  -    env:
  -      DEBUG: mud:*
  -      RPC_HTTP_URL: "http://127.0.0.1:8545"
  -      FOLLOW_BLOCK_TAG: "latest"
  -      SQLITE_FILENAME: "indexer.db"
  ```

- 6c056de: Table filters are now included as part of the URL. This enables deep links and improves navigating between pages without losing search state.
  - @latticexyz/common@2.2.9
  - @latticexyz/config@2.2.9
  - @latticexyz/protocol-parser@2.2.9
  - @latticexyz/schema-type@2.2.9
  - @latticexyz/store@2.2.9
  - @latticexyz/store-indexer@2.2.9
  - @latticexyz/store-sync@2.2.9
  - @latticexyz/world@2.2.9

## 2.2.8

### Patch Changes

- Updated dependencies [7c7bdb2]
  - @latticexyz/common@2.2.8
  - @latticexyz/store-sync@2.2.8
  - @latticexyz/protocol-parser@2.2.8
  - @latticexyz/store@2.2.8
  - @latticexyz/world@2.2.8
  - @latticexyz/schema-type@2.2.8

## 2.2.7

### Patch Changes

- 5a6c03c: Fixed `observer` decorator types so it can be used in more places.
- 7ac2a0d: Table selector of the Explore tab now has an input for searching/filtering tables by name.
- d21c1d1: Renamed optional `waitForStateChange` param in `observer()` decorator to `waitForTransaction` to better align with `@latticexyz/store-sync` packages.

  ```diff
   const { waitForTransaction } = syncToZustand(...);
  -observer({ waitForStateChange: waitForTransaction });
  +observer({ waitForTransaction });
  ```

- Updated dependencies [a08ba5e]
  - @latticexyz/store@2.2.7
  - @latticexyz/store-sync@2.2.7
  - @latticexyz/world@2.2.7
  - @latticexyz/common@2.2.7
  - @latticexyz/protocol-parser@2.2.7
  - @latticexyz/schema-type@2.2.7

## 2.2.6

### Patch Changes

- Updated dependencies [8dc5889]
  - @latticexyz/store-sync@2.2.6
  - @latticexyz/common@2.2.6
  - @latticexyz/protocol-parser@2.2.6
  - @latticexyz/schema-type@2.2.6
  - @latticexyz/store@2.2.6
  - @latticexyz/world@2.2.6

## 2.2.5

### Patch Changes

- 55ae822: Refactored `observer` initialization to reuse bridge iframes with the same `url`.
- 55ae822: Fixed favicon paths and fixed a few issues where we were incorrectly redirecting based on the chain name or ID.
- 55ae822: Fixed an issue where the `observer` Viem client decorator required an empty object arg when no options are used.

  ```diff
  -client.extend(observer({}));
  +client.extend(observer());
  ```

  - @latticexyz/common@2.2.5
  - @latticexyz/protocol-parser@2.2.5
  - @latticexyz/schema-type@2.2.5
  - @latticexyz/store@2.2.5
  - @latticexyz/store-sync@2.2.5
  - @latticexyz/world@2.2.5

## 2.2.4

### Patch Changes

- e6147b2: World Explorer now supports connecting external wallets.
- 50010fb: Bumped viem, wagmi, and abitype packages to their latest release.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
  ```

- 2060495: Added ability to connect World Explorer to Redstone and Garnet chains. The active chain is now passed as a dynamic route parameter.
- 784e5a9: World Explorer package now exports an `observer` Viem decorator that can be used to get visibility into contract writes initiated from your app. You can watch these writes stream in on the new "Observe" tab of the World Explorer.

  ```ts
  import { createClient, publicActions, walletActions } from "viem";
  import { observer } from "@latticexyz/explorer/observer";

  const client = createClient({ ... })
    .extend(publicActions)
    .extend(walletActions)
    .extend(observer());
  ```

  By default, the `observer` action assumes the World Explorer is running at `http://localhost:13690`, but this can be customized with the `explorerUrl` option.

  ```ts
  observer({
    explorerUrl: "http://localhost:4444",
  });
  ```

  If you want to measure the timing of transaction-to-state-change, you can also pass in a `waitForStateChange` function that takes a transaction hash and returns a partial [`TransactionReceipt`](https://viem.sh/docs/glossary/types#transactionreceipt) with `blockNumber`, `status`, and `transactionHash`. This mirrors the `waitForTransaction` function signature returned by `syncTo...` helper in `@latticexyz/store-sync`.

  ```ts
  observer({
    async waitForStateChange(hash) {
      return await waitForTransaction(hash);
    },
  });
  ```

- Updated dependencies [2f935cf]
- Updated dependencies [50010fb]
- Updated dependencies [1f24978]
- Updated dependencies [8b4110e]
  - @latticexyz/common@2.2.4
  - @latticexyz/protocol-parser@2.2.4
  - @latticexyz/schema-type@2.2.4
  - @latticexyz/store-sync@2.2.4
  - @latticexyz/store@2.2.4
  - @latticexyz/world@2.2.4

## 2.2.3

### Patch Changes

- b9c61a9: Fixed an issue with `--worldAddress` CLI flag being incorrectly interpreted as a number rather a hex string. Additionally, added `--hostname` option for specifying the hostname on which to start the application.
- Updated dependencies [8546452]
  - @latticexyz/world@2.2.3
  - @latticexyz/store-sync@2.2.3
  - @latticexyz/common@2.2.3
  - @latticexyz/protocol-parser@2.2.3
  - @latticexyz/schema-type@2.2.3
  - @latticexyz/store@2.2.3

## 2.2.2

### Patch Changes

- fb9def8: Format account balances with comma-separated thousands and trimmed decimal places for better readability.
- 4b86c04: Added error messages to error page to facilitate easier troubleshooting.
  - @latticexyz/common@2.2.2
  - @latticexyz/protocol-parser@2.2.2
  - @latticexyz/schema-type@2.2.2
  - @latticexyz/store@2.2.2
  - @latticexyz/store-sync@2.2.2
  - @latticexyz/world@2.2.2

## 2.2.1

### Patch Changes

- Updated dependencies [603b2ab]
- Updated dependencies [c0764a5]
  - @latticexyz/store-sync@2.2.1
  - @latticexyz/common@2.2.1
  - @latticexyz/protocol-parser@2.2.1
  - @latticexyz/store@2.2.1
  - @latticexyz/world@2.2.1
  - @latticexyz/schema-type@2.2.1

## 2.2.0

### Minor Changes

- f1d8d71: Initial release of the `@latticexyz/explorer` package. World Explorer is a standalone tool designed to explore and manage worlds. This initial release supports local worlds, with plans to extend support to any world in the future.

  Read more on how to get started or contribute in the [World Explorer README](https://github.com/latticexyz/mud/blob/main/packages/explorer/README.md).

### Patch Changes

- Updated dependencies [69cd0a1]
- Updated dependencies [04c675c]
- Updated dependencies [04c675c]
  - @latticexyz/common@2.2.0
  - @latticexyz/store@2.2.0
  - @latticexyz/world@2.2.0
  - @latticexyz/protocol-parser@2.2.0
  - @latticexyz/store-sync@2.2.0
  - @latticexyz/schema-type@2.2.0
