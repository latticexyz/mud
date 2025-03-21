# @latticexyz/explorer

## 2.2.21

### Patch Changes

- 1d354b8: Added Pyrope testnet chain.
- af2865b: Deleted records no longer appear in the table data viewer when using the SQLite indexer.
- 581228b: The Explore tab's table viewer now supports pagination through limit/offset clauses in SQL queries.
- aeb210f: Added an ABI page for exploring world ABI. The ABI Explorer also includes a form for searching custom errors or functions based on their selectors.
- 303714d: Table data refetching is now enabled for locally run Explorer instances.
- Updated dependencies [1d354b8]
- Updated dependencies [8cdc57b]
- Updated dependencies [b18c0ef]
- Updated dependencies [8b83c6b]
  - @latticexyz/common@2.2.21
  - @latticexyz/world@2.2.21
  - @latticexyz/store-indexer@2.2.21
  - @latticexyz/block-logs-stream@2.2.21
  - @latticexyz/config@2.2.21
  - @latticexyz/protocol-parser@2.2.21
  - @latticexyz/store@2.2.21
  - @latticexyz/store-sync@2.2.21
  - @latticexyz/schema-type@2.2.21

## 2.2.20

### Patch Changes

- 3067075: Table names in SQL queries are now automatically enclosed in double quotes by default, allowing support for special characters.
- Updated dependencies [3187081]
- Updated dependencies [06e48e0]
- Updated dependencies [3915759]
- Updated dependencies [06e48e0]
- Updated dependencies [3187081]
  - @latticexyz/world@2.2.20
  - @latticexyz/store@2.2.20
  - @latticexyz/store-sync@2.2.20
  - @latticexyz/store-indexer@2.2.20
  - @latticexyz/block-logs-stream@2.2.20
  - @latticexyz/common@2.2.20
  - @latticexyz/config@2.2.20
  - @latticexyz/protocol-parser@2.2.20
  - @latticexyz/schema-type@2.2.20

## 2.2.19

### Patch Changes

- @latticexyz/block-logs-stream@2.2.19
- @latticexyz/common@2.2.19
- @latticexyz/config@2.2.19
- @latticexyz/protocol-parser@2.2.19
- @latticexyz/schema-type@2.2.19
- @latticexyz/store@2.2.19
- @latticexyz/store-indexer@2.2.19
- @latticexyz/store-sync@2.2.19
- @latticexyz/world@2.2.19

## 2.2.18

### Patch Changes

- 6bd1695: Tables under internal namespace are now editable.
- c44207f: In the Interact tab, functions with tuple arguments can now be submitted. Additionally, function input fields display the tuple name when available and indicate tuple argument types.
- 4565714: Fixed an issue with how MUD table names were translated SQLite table names when querying.
- 8602248: Display a loading indicator on the query execution button while refetching a non-live query.
- Updated dependencies [16710f1]
- Updated dependencies [5d6fb1b]
- Updated dependencies [10ce339]
- Updated dependencies [df5d393]
  - @latticexyz/store-indexer@2.2.18
  - @latticexyz/store@2.2.18
  - @latticexyz/world@2.2.18
  - @latticexyz/common@2.2.18
  - @latticexyz/store-sync@2.2.18
  - @latticexyz/block-logs-stream@2.2.18
  - @latticexyz/config@2.2.18
  - @latticexyz/protocol-parser@2.2.18
  - @latticexyz/schema-type@2.2.18

## 2.2.17

### Patch Changes

- dab0d08: The context for the searched namespace and selected table is now preserved when reopening the table search and selection menu.
- 3d5b7b7: Add a separate flag and port for the indexer created by the Explorer.
- 3264908: Previously, queries could only be executed if they had changed, as data fetching was tied to query updates. Now, it’s possible to trigger a new table data fetch explicitly, regardless of whether the query has changed.
- 0812178: The Explorer now returns an empty array for empty results, instead of throwing an error, when using the local indexer.
- 0ea31c3: The loader in the Explore table now appears only during the initial data load. Additionally, a loading spinner has been added to the query submit button for non-live queries to indicate when a query is being refetched.
- Updated dependencies [94d82cf]
- Updated dependencies [40aaf97]
- Updated dependencies [5a9e238]
- Updated dependencies [9321a5c]
- Updated dependencies [589fd3a]
- Updated dependencies [7c3df69]
- Updated dependencies [40aaf97]
- Updated dependencies [227db4d]
- Updated dependencies [dead80e]
- Updated dependencies [56e65f6]
- Updated dependencies [7385948]
  - @latticexyz/world@2.2.17
  - @latticexyz/store-indexer@2.2.17
  - @latticexyz/store-sync@2.2.17
  - @latticexyz/block-logs-stream@2.2.17
  - @latticexyz/common@2.2.17
  - @latticexyz/protocol-parser@2.2.17
  - @latticexyz/config@2.2.17
  - @latticexyz/store@2.2.17
  - @latticexyz/schema-type@2.2.17

## 2.2.16

### Patch Changes

- 59389b1: Fixed an issue where live queries were running while paused and vice versa.
- 54e5c06: Added 'Copy to Clipboard' button to relevant sections for easier data copying.
- 05c7298: SQL query execution time in Explore table is now measured and displayed.
  - @latticexyz/block-logs-stream@2.2.16
  - @latticexyz/common@2.2.16
  - @latticexyz/config@2.2.16
  - @latticexyz/protocol-parser@2.2.16
  - @latticexyz/schema-type@2.2.16
  - @latticexyz/store@2.2.16
  - @latticexyz/store-indexer@2.2.16
  - @latticexyz/store-sync@2.2.16
  - @latticexyz/world@2.2.16

## 2.2.15

### Patch Changes

- b819749: Improved the performance of the explorer's `Interact` tab by fetching the ABI from an indexer instead of from an Ethereum RPC if available.
- 07b6be8: The transactions list in the explorer is now updated every 100ms instead of on every incoming transaction, to improve performance when there are many incoming transactions.
- 53f7906: The SQL editor now shows an indicator if the query has changed since it was last run.
- 722f4b4: The columns in the Explore tab table are now sorted correctly according to their types.
- 35cb94a: SQL live queries in the Explore view table can now be paused and resumed.
- 7fa68f6: Indicated MUD schema key columns in the table view of the Explore tab.
- 1a2b3c8: The functions in the Interact tab now display the emitted logs with the block explorer URL for the submitted transaction.
- 0592406: Added support for ERC-4337 bundled transactions, monitoring them by either listening to chain blocks or using the `observer` transport wrapper. Each user operation within a bundled transaction is displayed as an individual transaction in the Observe tab.
- 0facee0: When accessing a new table in Explore tab, the SQL editor now encloses all column names in double quotes in order to prevent invalid queries.
- 3258a6d: The latest ABI changes are now consistently fetched correctly.
- 2be543f: Fixed world ABI fetching in Rhodolite.
- d542357: Transactions in `Observe` tab now display decoded `callFrom` function calls.
- 09e9bd5: Moved viem to peer dependencies to ensure a single, consistent version is installed in downstream projects.
- 88b9daf: Observer transport now uses the `blockExplorers.worldsExplorer.url` from the chain config if no `explorerUrl` is provided.
- cfdfcc1: SQL queries can be executed using the Cmd/Ctrl + Enter shortcut.
- 9c1ca41: When accessing a new table in Explore tab, the SQL editor now encloses column names that are also PostgreSQL keywords in double quotes in order to prevent invalid queries.
- b0b42a9: Added support for exporting table data in CSV, JSON, and TXT formats.
- c681aa6: In the Explore tab, the view table now displays results generated by SQL query functions.
- Updated dependencies [9580d29]
- Updated dependencies [1770620]
- Updated dependencies [653f378]
- Updated dependencies [2d2aa08]
- Updated dependencies [5f493cd]
- Updated dependencies [cd9fd0a]
- Updated dependencies [09e9bd5]
- Updated dependencies [ba5191c]
- Updated dependencies [1b477d4]
- Updated dependencies [b819749]
- Updated dependencies [22674ad]
- Updated dependencies [9d71887]
- Updated dependencies [509a3cc]
- Updated dependencies [9ddc874]
- Updated dependencies [09536b0]
- Updated dependencies [a6fe15c]
- Updated dependencies [88b9daf]
- Updated dependencies [275c867]
  - @latticexyz/config@2.2.15
  - @latticexyz/store-sync@2.2.15
  - @latticexyz/world@2.2.15
  - @latticexyz/block-logs-stream@2.2.15
  - @latticexyz/common@2.2.15
  - @latticexyz/protocol-parser@2.2.15
  - @latticexyz/schema-type@2.2.15
  - @latticexyz/store-indexer@2.2.15
  - @latticexyz/store@2.2.15

## 2.2.14

### Patch Changes

- @latticexyz/store-sync@2.2.14
- @latticexyz/store-indexer@2.2.14
- @latticexyz/common@2.2.14
- @latticexyz/config@2.2.14
- @latticexyz/protocol-parser@2.2.14
- @latticexyz/schema-type@2.2.14
- @latticexyz/store@2.2.14
- @latticexyz/world@2.2.14

## 2.2.13

### Patch Changes

- 79d273a: The SQL query editor now supports multi-line input.
- Updated dependencies [dfc2d64]
  - @latticexyz/store-sync@2.2.13
  - @latticexyz/schema-type@2.2.13
  - @latticexyz/store@2.2.13
  - @latticexyz/world@2.2.13
  - @latticexyz/store-indexer@2.2.13
  - @latticexyz/common@2.2.13
  - @latticexyz/config@2.2.13
  - @latticexyz/protocol-parser@2.2.13

## 2.2.12

### Patch Changes

- 3d8db6f: Function filters in `Interact` tab are now included as part of the URL.
- 1b0ffcf: Transactions in Observe tab are now populated with timing metrics when using the `observer` Viem decorator in local projects.

  You can wire up your local project to use transaction timings with:

  ```
  import { observer } from "@latticexyz/explorer/observer";

  // Extend the Viem client that is performing writes
  walletClient.extend(observer());
  ```

- d4c10c1: Interact tab now displays decoded ABI errors for failed transactions.
- ea18f27: Bumped viem to v2.21.19.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.19
  ```

- 2c92401: Fixed inputs display in the transactions table row.
- af72530: Display error messages for failed queries within the Explore tab's table viewer.
- 3a80bed: Explore page now has a full-featured SQL editor with syntax highlighting, autocomplete, and query validation.
- 6476dec: Each chain's home page now lets you find and pick a world to explore.
- 9a43e87: - Not found page if invalid chain name.
  - Only show selector for worlds if options exist.
  - Remove "future time" from transactions table.
  - Improved layout for Interact tab.
  - Wrap long args in transactions table.
  - New tables polling.
  - Add logs (regression).
- 4b46409: Transactions are now monitored across all tabs while the World Explorer is open.
- Updated dependencies [20f44fb]
- Updated dependencies [ea18f27]
- Updated dependencies [41a6e2f]
- Updated dependencies [84ae33b]
- Updated dependencies [fe98442]
  - @latticexyz/store-indexer@2.2.12
  - @latticexyz/common@2.2.12
  - @latticexyz/config@2.2.12
  - @latticexyz/protocol-parser@2.2.12
  - @latticexyz/schema-type@2.2.12
  - @latticexyz/store-sync@2.2.12
  - @latticexyz/store@2.2.12
  - @latticexyz/world@2.2.12

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
