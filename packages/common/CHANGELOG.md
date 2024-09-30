# Change Log

## 2.2.10

### Patch Changes

- @latticexyz/schema-type@2.2.10

## 2.2.9

### Patch Changes

- @latticexyz/schema-type@2.2.9

## 2.2.8

### Patch Changes

- 7c7bdb2: Removed unused generics and ensure that we're only passing around the generics we need, when we need them. Hopefully this improves TS performance in MUD projects.
  - @latticexyz/schema-type@2.2.8

## 2.2.7

### Patch Changes

- @latticexyz/schema-type@2.2.7

## 2.2.6

### Patch Changes

- @latticexyz/schema-type@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/schema-type@2.2.5

## 2.2.4

### Patch Changes

- 2f935cf: To reset an account's nonce, the nonce manager uses the [`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount) RPC method,
  which returns the number of transactions sent from the account.
  When using the `pending` block tag, this includes transactions in the mempool that have not been included in a block yet.
  If an account submits a transaction with a nonce higher than the next valid nonce, this transaction will stay in the mempool until the nonce gap is closed and the transactions nonce is the next valid nonce.
  This means if an account has gapped transactions "stuck in the mempool", the `eth_getTransactionCount` method with `pending` block tag can't be used to get the next valid nonce
  (since it includes the number of transactions stuck in the mempool).
  Since the nonce manager only resets the nonce on reload or in case of a nonce error, using the `latest` block tag by default is the safer choice to be able to recover from nonce gaps.

  Note that this change may reveal more "transaction underpriced" errors than before. These errors will now be retried automatically and should go through after the next block is mined.

- 50010fb: Bumped viem, wagmi, and abitype packages to their latest release.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
  ```

- Updated dependencies [50010fb]
  - @latticexyz/schema-type@2.2.4

## 2.2.3

### Patch Changes

- @latticexyz/schema-type@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/schema-type@2.2.2

## 2.2.1

### Patch Changes

- c0764a5: `writeContract` and `sendTransaction` actions now use `pending` block tag when estimating gas. This aligns with previous behavior before changes in the last version.
  - @latticexyz/schema-type@2.2.1

## 2.2.0

### Patch Changes

- 69cd0a1: Updated all custom Viem actions to properly call other actions via `getAction` so they can be composed.
  - @latticexyz/schema-type@2.2.0

## 2.1.1

### Patch Changes

- 9e21e42: Bumped viem to `2.19.8` and abitype to `1.0.5`.

  MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.19.8 abitype@1.0.5
  ```

- 2daaab1: Refactored `writeContract` and `sendTransaction` actions for simplicity and better error messages.
- Updated dependencies [9e21e42]
  - @latticexyz/schema-type@2.1.1

## 2.1.0

### Patch Changes

- 7129a16: Removed `evaluate` and `satisfy` type utils in favor of `show` and `satisfy` from `@arktype/util`.
- 8d0453e: `resourceToHex` will now throw if provided namespace is >14 characters. Since namespaces are used to determine access control, it's not safe to automatically truncate to fit into `bytes14` as that may change the indended namespace for resource access.
  - @latticexyz/schema-type@2.1.0

## 2.0.12

### Patch Changes

- 96e7bf430: TS source has been removed from published packages in favor of DTS in an effort to improve TS performance. All packages now inherit from a base TS config in `@latticexyz/common` to allow us to continue iterating on TS performance without requiring changes in your project code.

  If you have a MUD project that you're upgrading, we suggest adding a `tsconfig.json` file to your project workspace that extends this base config.

  ```sh
  pnpm add -D @latticexyz/common
  echo "{\n  \"extends\": \"@latticexyz/common/tsconfig.base.json\"\n}" > tsconfig.json
  ```

  Then in each package of your project, inherit from your workspace root's config.

  For example, your TS config in `packages/contracts/tsconfig.json` might look like:

  ```json
  {
    "extends": "../../tsconfig.json"
  }
  ```

  And your TS config in `packages/client/tsconfig.json` might look like:

  ```json
  {
    "extends": "../../tsconfig.json",
    "compilerOptions": {
      "types": ["vite/client"],
      "target": "ESNext",
      "lib": ["ESNext", "DOM"],
      "jsx": "react-jsx",
      "jsxImportSource": "react"
    },
    "include": ["src"]
  }
  ```

  You may need to adjust the above configs to include any additional TS options you've set. This config pattern may also reveal new TS errors that need to be fixed or rules disabled.

  If you want to keep your existing TS configs, we recommend at least updating your `moduleResolution` setting.

  ```diff
  -"moduleResolution": "node"
  +"moduleResolution": "Bundler"
  ```

- Updated dependencies [96e7bf430]
  - @latticexyz/schema-type@2.0.12

## 2.0.11

### Patch Changes

- @latticexyz/schema-type@2.0.11

## 2.0.10

### Patch Changes

- 51b137d3: Added OP predeploy contracts for Redstone and Garnet chain configs and added chain-specific contracts for Redstone chain config.
  - @latticexyz/schema-type@2.0.10

## 2.0.9

### Patch Changes

- 764ca0a0: Added an optional `indexerUrl` property to `MUDChain`, and populated it in the Redstone and Garnet chain configs.
- bad3ad1b: Added chain icons to Redstone and Garnet chain configs via `chain.iconUrls`.
  - @latticexyz/schema-type@2.0.9

## 2.0.8

### Patch Changes

- df4781ac: Added Garnet testnet and Redstone mainnet chain configs and deprecated Lattice Testnet.

  ```ts
  import { garnet, redstone } from "@latticexyz/common/chains";
  ```

  - @latticexyz/schema-type@2.0.8

## 2.0.7

### Patch Changes

- 375d902e: Added asynchronous polling for current fees to `sendTransaction`.
- 38c61158: Added `kmsKeyToAccount`, a [viem custom account](https://viem.sh/docs/accounts/custom#custom-account) that signs transactions using AWS KMS.

  To use it, you must first install `@aws-sdk/client-kms@3.x` and `asn1.js@5.x` dependencies into your project. Then create a KMS account with:

  ```ts
  import { kmsKeyToAccount } from "@latticexyz/common/kms";
  const account = kmsKeyToAccount({ keyId: ... });
  ```

  By default, a `KMSClient` will be created, but you can also pass one in via the `client` option. The default KMS client will use [your environment's AWS SDK configuration](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/configuring-the-jssdk.html).

- f736c43d: `Resource` type props are now readonly.
  - @latticexyz/schema-type@2.0.7

## 2.0.6

### Patch Changes

- 6c8ab471: Reduced the number of RPC requests before sending a transaction in the `transactionQueue` viem decorator.
- c18e93c5: Bumped viem to 2.9.20.
- d95028a6: Bumped viem to 2.9.16.
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
  - @latticexyz/schema-type@2.0.6

## 2.0.5

### Patch Changes

- a9e8a407: Fixed `getNonceManager` to correctly pass all options to `createNonceManager`.
  - @latticexyz/schema-type@2.0.5

## 2.0.4

### Patch Changes

- 620e4ec1: `transactionQueue` now accepts a `queueConcurrency` to allow adjusting the number of concurrent calls to the mempool. This defaults to `1` to ensure transactions are ordered and nonces are handled properly. Any number greater than that is likely to see nonce errors and transactions arriving out of order, but this may be an acceptable trade-off for some applications that can safely retry.
  - @latticexyz/schema-type@2.0.4

## 2.0.3

### Patch Changes

- d2e4d0fb: `transactionQueue` decorator now accepts an optional `publicClient` argument, which will be used in place of the extended viem client for making public action calls (`getChainId`, `getTransactionCount`, `simulateContract`, `call`). This helps in cases where the extended viem client is a smart account client, like in [permissionless.js](https://github.com/pimlicolabs/permissionless.js), where the transport is the bundler, not an RPC.

  `writeObserver` decorator now accepts any `Client`, not just a `WalletClient`.

  `createBurnerAccount` now returns a `PrivateKeyAccount`, the more specific `Account` type.

  - @latticexyz/schema-type@2.0.3

## 2.0.2

### Patch Changes

- @latticexyz/schema-type@2.0.2

## 2.0.1

### Patch Changes

- @latticexyz/schema-type@2.0.1

## 2.0.0

### Major Changes

- 65c9546c4: - Add `renderWithFieldSuffix` helper method to always render a field function with a suffix, and optionally render the same function without a suffix.
  - Remove `methodNameSuffix` from `RenderField` interface, because the suffix is now computed as part of `renderWithFieldSuffix`.
- 44236041f: Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

  ```diff
  -import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
  +import { SomeTable } from "./codegen/tables/SomeTable.sol";

  -console.log(SomeTableTableId);
  +console.log(SomeTable._tableId);

  -console.log(SomeTable.getFieldLayout());
  +console.log(SomeTable._fieldLayout);
  ```

- bfcb293d1: What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- 5e723b90e: - `ResourceSelector` is replaced with `ResourceId`, `ResourceIdLib`, `ResourceIdInstance`, `WorldResourceIdLib` and `WorldResourceIdInstance`.

  Previously a "resource selector" was a `bytes32` value with the first 16 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.
  Now a "resource ID" is a `bytes32` value with the first 2 bytes reserved for the resource type, the next 14 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.

  Previously `ResouceSelector` was a library and the resource selector type was a plain `bytes32`.
  Now `ResourceId` is a user type, and the functionality is implemented in the `ResourceIdInstance` (for type) and `WorldResourceIdInstance` (for namespace and name) libraries.
  We split the logic into two libraries, because `Store` now also uses `ResourceId` and needs to be aware of resource types, but not of namespaces/names.

  ```diff
  - import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";
  + import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
  + import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
  + import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

  - bytes32 systemId = ResourceSelector.from("namespace", "name");
  + ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "namespace", "name");

  - using ResourceSelector for bytes32;
  + using WorldResourceIdInstance for ResourceId;
  + using ResourceIdInstance for ResourceId;

    systemId.getName();
    systemId.getNamespace();
  + systemId.getType();

  ```

  - All `Store` and `World` methods now use the `ResourceId` type for `tableId`, `systemId`, `moduleId` and `namespaceId`.
    All mentions of `resourceSelector` were renamed to `resourceId` or the more specific type (e.g. `tableId`, `systemId`)

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IStore {
      function setRecord(
    -   bytes32 tableId,
    +   ResourceId tableId,
        bytes32[] calldata keyTuple,
        bytes calldata staticData,
        PackedCounter encodedLengths,
        bytes calldata dynamicData,
        FieldLayout fieldLayout
      ) external;

      // Same for all other methods
    }
    ```

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IBaseWorld {
      function callFrom(
        address delegator,
    -   bytes32 resourceSelector,
    +   ResourceId systemId,
        bytes memory callData
      ) external payable returns (bytes memory);

      // Same for all other methods
    }
    ```

- 60cfd089f: Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

  These new sync packages come with support for our `recs` package, including `encodeEntity` and `decodeEntity` utilities for composite keys.

  If you're using `store-cache` and `useRow`/`useRows`, you should wait to upgrade until we have a suitable replacement for those libraries. We're working on a [sql.js](https://github.com/sql-js/sql.js/)-powered sync module that will replace `store-cache`.

  **Migrate existing RECS apps to new sync packages**

  As you migrate, you may find some features replaced, removed, or not included by default. Please [open an issue](https://github.com/latticexyz/mud/issues/new) and let us know if we missed anything.

  1. Add `@latticexyz/store-sync` package to your app's `client` package and make sure `viem` is pinned to version `1.3.1` (otherwise you may get type errors)
  2. In your `supportedChains.ts`, replace `foundry` chain with our new `mudFoundry` chain.

     ```diff
     - import { foundry } from "viem/chains";
     - import { MUDChain, latticeTestnet } from "@latticexyz/common/chains";
     + import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";

     - export const supportedChains: MUDChain[] = [foundry, latticeTestnet];
     + export const supportedChains: MUDChain[] = [mudFoundry, latticeTestnet];
     ```

  3. In `getNetworkConfig.ts`, remove the return type (to let TS infer it for now), remove now-unused config values, and add the viem `chain` object.

     ```diff
     - export async function getNetworkConfig(): Promise<NetworkConfig> {
     + export async function getNetworkConfig() {
     ```

     ```diff
       const initialBlockNumber = params.has("initialBlockNumber")
         ? Number(params.get("initialBlockNumber"))
     -   : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC
     +   : world?.blockNumber ?? 0n;
     ```

     ```diff
     + return {
     +   privateKey: getBurnerWallet().value,
     +   chain,
     +   worldAddress,
     +   initialBlockNumber,
     +   faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
     + };
     ```

  4. In `setupNetwork.ts`, replace `setupMUDV2Network` with `syncToRecs`.

     ```diff
     - import { setupMUDV2Network } from "@latticexyz/std-client";
     - import { createFastTxExecutor, createFaucetService, getSnapSyncRecords } from "@latticexyz/network";
     + import { createFaucetService } from "@latticexyz/network";
     + import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex, parseEther, ClientConfig } from "viem";
     + import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
     + import { createBurnerAccount, createContract, transportObserver } from "@latticexyz/common";
     ```

     ```diff
     - const result = await setupMUDV2Network({
     -   ...
     - });

     + const clientOptions = {
     +   chain: networkConfig.chain,
     +   transport: transportObserver(fallback([webSocket(), http()])),
     +   pollingInterval: 1000,
     + } as const satisfies ClientConfig;

     + const publicClient = createPublicClient(clientOptions);

     + const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
     + const burnerWalletClient = createWalletClient({
     +   ...clientOptions,
     +   account: burnerAccount,
     + });

     + const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
     +   world,
     +   config: storeConfig,
     +   address: networkConfig.worldAddress as Hex,
     +   publicClient,
     +   components: contractComponents,
     +   startBlock: BigInt(networkConfig.initialBlockNumber),
     +   indexerUrl: networkConfig.indexerUrl ?? undefined,
     + });

     + const worldContract = createContract({
     +   address: networkConfig.worldAddress as Hex,
     +   abi: IWorld__factory.abi,
     +   publicClient,
     +   walletClient: burnerWalletClient,
     + });
     ```

     ```diff
       // Request drip from faucet
     - const signer = result.network.signer.get();
     - if (networkConfig.faucetServiceUrl && signer) {
     -   const address = await signer.getAddress();
     + if (networkConfig.faucetServiceUrl) {
     +   const address = burnerAccount.address;
     ```

     ```diff
       const requestDrip = async () => {
     -   const balance = await signer.getBalance();
     +   const balance = await publicClient.getBalance({ address });
         console.info(`[Dev Faucet]: Player balance -> ${balance}`);
     -   const lowBalance = balance?.lte(utils.parseEther("1"));
     +   const lowBalance = balance < parseEther("1");
     ```

     You can remove the previous ethers `worldContract`, snap sync code, and fast transaction executor.

     The return of `setupNetwork` is a bit different than before, so you may have to do corresponding app changes.

     ```diff
     + return {
     +   world,
     +   components,
     +   playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
     +   publicClient,
     +   walletClient: burnerWalletClient,
     +   latestBlock$,
     +   blockStorageOperations$,
     +   waitForTransaction,
     +   worldContract,
     + };
     ```

  5. Update `createSystemCalls` with the new return type of `setupNetwork`.

     ```diff
       export function createSystemCalls(
     -   { worldSend, txReduced$, singletonEntity }: SetupNetworkResult,
     +   { worldContract, waitForTransaction }: SetupNetworkResult,
         { Counter }: ClientComponents
       ) {
          const increment = async () => {
     -      const tx = await worldSend("increment", []);
     -      await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
     +      const tx = await worldContract.write.increment();
     +      await waitForTransaction(tx);
            return getComponentValue(Counter, singletonEntity);
          };
     ```

  6. (optional) If you still need a clock, you can create it with:

     ```ts
     import { map, filter } from "rxjs";
     import { createClock } from "@latticexyz/network";

     const clock = createClock({
       period: 1000,
       initialTime: 0,
       syncInterval: 5000,
     });

     world.registerDisposer(() => clock.dispose());

     latestBlock$
       .pipe(
         map((block) => Number(block.timestamp) * 1000), // Map to timestamp in ms
         filter((blockTimestamp) => blockTimestamp !== clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
         filter((blockTimestamp) => blockTimestamp !== clock.currentTime), // Ignore if the current local timestamp is correct
       )
       .subscribe(clock.update); // Update the local clock
     ```

  If you're using the previous `LoadingState` component, you'll want to migrate to the new `SyncProgress`:

  ```ts
  import { SyncStep, singletonEntity } from "@latticexyz/store-sync/recs";

  const syncProgress = useComponentValue(SyncProgress, singletonEntity, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
  });

  if (syncProgress.step === SyncStep.LIVE) {
    // we're live!
  }
  ```

- 6c6733256: Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.
- cd5abcc3b: Add utils for using viem with MUD

  - `createContract` is a wrapper around [viem's `getContract`](https://viem.sh/docs/contract/getContract.html) but with better nonce handling for faster executing of transactions. It has the same arguments and return type as `getContract`.
  - `createNonceManager` helps track local nonces, used by `createContract`.

  Also renames `mudTransportObserver` to `transportObserver`.

### Minor Changes

- aabd30767: Bumped Solidity version to 0.8.24.
- 331dbfdcb: `readHex` was moved from `@latticexyz/protocol-parser` to `@latticexyz/common`
- 066056154: - Added a `sendTransaction` helper to mirror viem's `sendTransaction`, but with our nonce manager
  - Added an internal mempool queue to `sendTransaction` and `writeContract` for better nonce handling
  - Defaults block tag to `pending` for transaction simulation and transaction count (when initializing the nonce manager)
- 3fb9ce283: Add utils for using viem with MUD

  - `mudFoundry` chain with a transaction request formatter that temporarily removes max fees to work better with anvil `--base-fee 0`
  - `createBurnerAccount` that also temporarily removes max fees during transaction signing to work better with anvil `--base-fee 0`
  - `mudTransportObserver` that will soon let MUD Dev Tools observe transactions

  You can use them like:

  ```ts
  import { createBurnerAccount, mudTransportObserver } from "@latticexyz/common";
  import { mudFoundry } from "@latticexyz/common/chains";

  createWalletClient({
    account: createBurnerAccount(privateKey),
    chain: mudFoundry,
    transport: mudTransportObserver(http()),
    pollingInterval: 1000,
  });
  ```

- 939916bcd: `createContract` now has an `onWrite` callback so you can observe writes. This is useful for wiring up the transanction log in MUD dev tools.

  ```ts
  import { createContract, ContractWrite } from "@latticexyz/common";
  import { Subject } from "rxjs";

  const write$ = new Subject<ContractWrite>();
  creactContract({
    ...
    onWrite: (write) => write$.next(write),
  });
  ```

- b8a6158d6: - adds `defaultPriorityFee` to `mudFoundry` for better support with MUD's default anvil config and removes workaround in `createContract`
  - improves nonce error detection using viem's custom errors
- 59267655: Added viem custom client actions that work the same as MUD's now-deprecated `getContract`, `writeContract`, and `sendTransaction` wrappers. Templates have been updated to reflect the new patterns.

  You can migrate your own code like this:

  ```diff
  -import { createWalletClient } from "viem";
  -import { getContract, writeContract, sendTransaction } from "@latticexyz/common";
  +import { createWalletClient, getContract } from "viem";
  +import { transactionQueue, writeObserver } from "@latticexyz/common/actions";

  -const walletClient = createWalletClient(...);
  +const walletClient = createWalletClient(...)
  +  .extend(transactionQueue())
  +  .extend(writeObserver({ onWrite });

   const worldContract = getContract({
     client: { publicClient, walletClient },
  -  onWrite,
   });
  ```

- 1b5eb0d07: Added `unique` and `groupBy` array helpers to `@latticexyz/common/utils`.

  ```ts
  import { unique } from "@latticexyz/common/utils";

  unique([1, 2, 1, 4, 3, 2]);
  // [1, 2, 4, 3]
  ```

  ```ts
  import { groupBy } from "@latticexyz/common/utils";

  const records = [
    { type: "cat", name: "Bob" },
    { type: "cat", name: "Spot" },
    { type: "dog", name: "Rover" },
  ];
  Object.fromEntries(groupBy(records, (record) => record.type));
  // {
  //   "cat": [{ type: "cat", name: "Bob" }, { type: "cat", name: "Spot" }],
  //   "dog: [{ type: "dog", name: "Rover" }]
  // }
  ```

- 44a5432ac: - Add `getRemappings` to get foundry remappings as an array of `[to, from]` tuples.
  - Add `extractUserTypes` solidity parser utility to extract user-defined types.
  - Add `loadAndExtractUserTypes` helper to load and parse a solidity file, extracting user-defined types.
- d075f82f3: - Moves contract write logic out of `createContract` into its own `writeContract` method so that it can be used outside of the contract instance, and for consistency with viem.

  - Deprecates `createContract` in favor of `getContract` for consistency with viem.
  - Reworks `createNonceManager`'s `BroadcastChannel` setup and moves out the notion of a "nonce manager ID" to `getNonceManagerId` so we can create an internal cache with `getNonceManager` for use in `writeContract`.

  If you were using the `createNonceManager` before, you'll just need to rename `publicClient` argument to `client`:

  ```diff
    const publicClient = createPublicClient({ ... });
  - const nonceManager = createNonceManager({ publicClient, ... });
  + const nonceManager = createNonceManager({ client: publicClient, ... });
  ```

- 331dbfdcb: `spliceHex` was added, which has a similar API as JavaScript's [`Array.prototype.splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice), but for `Hex` strings.

  ```ts
  spliceHex("0x123456", 1, 1, "0x0000"); // "0x12000056"
  ```

- 92de59982: Bump Solidity version to 0.8.21
- 0c4f9fea9: `TableId.toHex()` now truncates name/namespace to 16 bytes each, to properly fit into a `bytes32` hex string.

  Also adds a few utils we'll need in the indexer:

  - `bigIntMin` is similar to `Math.min` but for `bigint`s
  - `bigIntMax` is similar to `Math.max` but for `bigint`s
  - `bigIntSort` for sorting an array of `bigint`s
  - `chunk` to split an array into chunks
  - `wait` returns a `Promise` that resolves after specified number of milliseconds

- 708b49c50: Generated table libraries now have a set of functions prefixed with `_` that always use their own storage for read/write.
  This saves gas for use cases where the functionality to dynamically determine which `Store` to use for read/write is not needed, e.g. root systems in a `World`, or when using `Store` without `World`.

  We decided to continue to always generate a set of functions that dynamically decide which `Store` to use, so that the generated table libraries can still be imported by non-root systems.

  ```solidity
  library Counter {
    // Dynamically determine which store to write to based on the context
    function set(uint32 value) internal;

    // Always write to own storage
    function _set(uint32 value) internal;

    // ... equivalent functions for all other Store methods
  }
  ```

- d2f8e9400: Renames `resourceIdToHex` to `resourceToHex` and `hexToResourceId` to `hexToResource`, to better distinguish between a resource ID (hex value) and a resource reference (type, namespace, name).

  ```diff
  - resourceIdToHex({ type: 'table', namespace: '', name: 'Position' });
  + resourceToHex({ type: 'table', namespace: '', name: 'Position' });
  ```

  ```diff
  - hexToResourceId('0x...');
  + hexToResource('0x...');
  ```

  Previous methods still exist but are now deprecated to ease migration and reduce breaking changes. These will be removed in a future version.

  Also removes the previously deprecated and unused table ID utils (replaced by these resource ID utils).

- b1d41727d: Added a `mapObject` helper to map the value of each property of an object to a new value.
- 4c1dcd81e: - Added a `Result<Ok, Err>` type for more explicit and typesafe error handling ([inspired by Rust](https://doc.rust-lang.org/std/result/)).

  - Added a `includes` util as typesafe alternative to [`Array.prototype.includes()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes).

- 6071163f7: - Moves zero gas fee override to `createContract` until https://github.com/wagmi-dev/viem/pull/963 or similar feature lands
  - Skip simulation if `gas` is provided
- d7b1c588a: Upgraded all packages and templates to viem v2.7.12 and abitype v1.0.0.

  Some viem APIs have changed and we've updated `getContract` to reflect those changes and keep it aligned with viem. It's one small code change:

  ```diff
   const worldContract = getContract({
     address: worldAddress,
     abi: IWorldAbi,
  -  publicClient,
  -  walletClient,
  +  client: { public: publicClient, wallet: walletClient },
   });
  ```

- 5df1f31bc: Updated `chunk` types to use readonly arrays
- cea754dde: - The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
  This is to prevent invalid `FieldLayout` values being passed, which could cause the onchain state to diverge from the indexer state.
  However, the internal `StoreCore` library still exposes a `setRecord` and `deleteRecord` method that allows a `FieldLayout` to be passed.
  This is because `StoreCore` can only be used internally, so the `FieldLayout` value can be trusted and we can save the gas for accessing storage.

  ```diff
  interface IStore {
    function setRecord(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      bytes calldata staticData,
      PackedCounter encodedLengths,
      bytes calldata dynamicData,
  -   FieldLayout fieldLayout
    ) external;

    function deleteRecord(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   FieldLayout fieldLayout
    ) external;
  }
  ```

  - The `spliceStaticData` method and `Store_SpliceStaticData` event of `IStore` and `StoreCore` no longer include `deleteCount` in their signature.
    This is because when splicing static data, the data after `start` is always overwritten with `data` instead of being shifted, so `deleteCount` is always the length of the data to be written.

    ```diff

    event Store_SpliceStaticData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
    - uint40 deleteCount,
      bytes data
    );

    interface IStore {
      function spliceStaticData(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
        uint48 start,
    -   uint40 deleteCount,
        bytes calldata data
      ) external;
    }
    ```

  - The `updateInField` method has been removed from `IStore`, as it's almost identical to the more general `spliceDynamicData`.
    If you're manually calling `updateInField`, here is how to upgrade to `spliceDynamicData`:

    ```diff
    - store.updateInField(tableId, keyTuple, fieldIndex, startByteIndex, dataToSet, fieldLayout);
    + uint8 dynamicFieldIndex = fieldIndex - fieldLayout.numStaticFields();
    + store.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, uint40(startByteIndex), uint40(dataToSet.length), dataToSet);
    ```

  - All other methods that are only valid for dynamic fields (`pushToField`, `popFromField`, `getFieldSlice`)
    have been renamed to make this more explicit (`pushToDynamicField`, `popFromDynamicField`, `getDynamicFieldSlice`).

    Their `fieldIndex` parameter has been replaced by a `dynamicFieldIndex` parameter, which is the index relative to the first dynamic field (i.e. `dynamicFieldIndex` = `fieldIndex` - `numStaticFields`).
    The `FieldLayout` parameter has been removed, as it was only used to calculate the `dynamicFieldIndex` in the method.

    ```diff
    interface IStore {
    - function pushToField(
    + function pushToDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        bytes calldata dataToPush,
    -   FieldLayout fieldLayout
      ) external;

    - function popFromField(
    + function popFromDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        uint256 byteLengthToPop,
    -   FieldLayout fieldLayout
      ) external;

    - function getFieldSlice(
    + function getDynamicFieldSlice(
        ResourceId tableId,
        bytes32[] memory keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
    -   FieldLayout fieldLayout,
        uint256 start,
        uint256 end
      ) external view returns (bytes memory data);
    }
    ```

  - `IStore` has a new `getDynamicFieldLength` length method, which returns the byte length of the given dynamic field and doesn't require the `FieldLayout`.

    ```diff
    IStore {
    + function getDynamicFieldLength(
    +   ResourceId tableId,
    +   bytes32[] memory keyTuple,
    +   uint8 dynamicFieldIndex
    + ) external view returns (uint256);
    }

    ```

  - `IStore` now has additional overloads for `getRecord`, `getField`, `getFieldLength` and `setField` that don't require a `FieldLength` to be passed, but instead load it from storage.
  - `IStore` now exposes `setStaticField` and `setDynamicField` to save gas by avoiding the dynamic inference of whether the field is static or dynamic.
  - The `getDynamicFieldSlice` method no longer accepts reading outside the bounds of the dynamic field.
    This is to avoid returning invalid data, as the data of a dynamic field is not deleted when the record is deleted, but only its length is set to zero.

- 331f0d636: Deprecate `@latticexyz/std-client` and remove v1 network dependencies.

  - `getBurnerWallet` is replaced by `getBurnerPrivateKey` from `@latticexyz/common`. It now returns a `Hex` string instead of an `rxjs` `BehaviorSubject`.

    ```
    - import { getBurnerWallet } from "@latticexyz/std-client";
    + import { getBurnerPrivateKey } from "@latticexyz/common";

    - const privateKey = getBurnerWallet().value;
    - const privateKey = getBurnerPrivateKey();
    ```

  - All functions from `std-client` that depended on v1 network code are removed (most notably `setupMUDNetwork` and `setupMUDV2Network`). Consumers should upgrade to v2 networking code from `@latticexyz/store-sync`.
  - The following functions are removed from `std-client` because they are very use-case specific and depend on deprecated code: `getCurrentTurn`, `getTurnAtTime`, `getGameConfig`, `isUntraversable`, `getPlayerEntity`, `resolveRelationshipChain`, `findEntityWithComponentInRelationshipChain`, `findInRelationshipChain`. Consumers should vendor these functions if they are still needed.
  - Remaining exports from `std-client` are moved to `/deprecated`. The package will be removed in a future release (once there are replacements for the deprecated exports).

    ```diff
    - import { ... } from "@latticexyz/std-client";
    + import { ... } from "@latticexyz/std-client/deprecated";
    ```

### Patch Changes

- a35c05ea9: Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
- 16b13ea8f: Adds viem workaround for zero base fee used by MUD's anvil config
- 82693072: `waitForIdle` now falls back to `setTimeout` for environments without `requestIdleCallback`.
- d5c0682fb: Updated all human-readable resource IDs to use `{namespace}__{name}` for consistency with world function signatures.
- 01e46d99: Removed some unused files, namely `curry` in `@latticexyz/common` and `useDeprecatedComputedValue` from `@latticexyz/react`.
- bb6ada740: Initial sync from indexer no longer blocks the promise returning from `createStoreSync`, `syncToRecs`, and `syncToSqlite`. This should help with rendering loading screens using the `SyncProgress` RECS component and avoid the long flashes of no content in templates.

  By default, `syncToRecs` and `syncToSqlite` will start syncing (via observable subscription) immediately after called.

  If your app needs to control when syncing starts, you can use the `startSync: false` option and then `blockStoreOperations$.subscribe()` to start the sync yourself. Just be sure to unsubscribe to avoid memory leaks.

  ```ts
  const { blockStorageOperations$ } = syncToRecs({
    ...
    startSync: false,
  });

  // start sync manually by subscribing to `blockStorageOperation# Change Log
  const subcription = blockStorageOperation$.subscribe();

  // clean up subscription
  subscription.unsubscribe();
  ```

- 35c9f33df: - Remove need for tx queue in `createContract`
- 0b8ce3f2c: Minor fix to resolving user types: `solc` doesn't like relative imports without `./`, but is fine with relative imports from `./../`, so we always append `./` to the relative path.
- 933b54b5f: The benchmark util now logs to `stdout` instead of `stderr`.
- 307abab3: `resourceToLabel` now correctly returns just the resource name if its in the root namespace.
- aacffcb59: Pinned prettier-plugin-solidity version to 1.1.3
- f99e88987: Bump viem to 1.14.0 and abitype to 0.9.8
- e34d1170: Moved the transaction simulation step to just before sending the transaction in our transaction queue actions (`sendTransaction` and `writeContract`).

  This helps avoid cascading transaction failures for deep queues or when a transaction succeeding depends on the value of the previous.

- db314a74: Upgraded prettier version to 3.2.5 and prettier-plugin-solidity version to 1.3.1.
- 8d51a0348: Clean up Memory.sol, make mcopy pure
- c162ad5a5: Prevented errors not included in the contract (but present in the file) from being included in the interface by `contractToInterface`
- f62c767e7: Moved some codegen to use `fs/promises` for better parallelism.
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- b8a6158d6: bump viem to 1.6.0
- 5d737cf2e: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 3e057061d: Removed chalk usage from modules imported in client fix downstream client builds (vite in particular).
- 535229984: - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- 24a6cd536: Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.
- 25086be5f: Replaced temporary `.mudtest` file in favor of `WORLD_ADDRESS` environment variable when running tests with `MudTest` contract
- c4f49240d: Table libraries now correctly handle uninitialized fixed length arrays.
- cc2c8da00: - Refactor tightcoder to use typescript functions instead of ejs
  - Optimize `TightCoder` library
  - Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers
- Updated dependencies [aabd30767]
- Updated dependencies [b38c096d]
- Updated dependencies [f99e88987]
- Updated dependencies [48909d151]
- Updated dependencies [b02f9d0e4]
- Updated dependencies [bb91edaa0]
- Updated dependencies [590542030]
- Updated dependencies [f03531d97]
- Updated dependencies [b8a6158d6]
- Updated dependencies [92de59982]
- Updated dependencies [535229984]
- Updated dependencies [d7b1c588a]
  - @latticexyz/schema-type@2.0.0

## 2.0.0-next.18

### Major Changes

- 44236041: Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

  ```diff
  -import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
  +import { SomeTable } from "./codegen/tables/SomeTable.sol";

  -console.log(SomeTableTableId);
  +console.log(SomeTable._tableId);

  -console.log(SomeTable.getFieldLayout());
  +console.log(SomeTable._fieldLayout);
  ```

### Minor Changes

- 59267655: Added viem custom client actions that work the same as MUD's now-deprecated `getContract`, `writeContract`, and `sendTransaction` wrappers. Templates have been updated to reflect the new patterns.

  You can migrate your own code like this:

  ```diff
  -import { createWalletClient } from "viem";
  -import { getContract, writeContract, sendTransaction } from "@latticexyz/common";
  +import { createWalletClient, getContract } from "viem";
  +import { transactionQueue, writeObserver } from "@latticexyz/common/actions";

  -const walletClient = createWalletClient(...);
  +const walletClient = createWalletClient(...)
  +  .extend(transactionQueue())
  +  .extend(writeObserver({ onWrite });

   const worldContract = getContract({
     client: { publicClient, walletClient },
  -  onWrite,
   });
  ```

- d7b1c588a: Upgraded all packages and templates to viem v2.7.12 and abitype v1.0.0.

  Some viem APIs have changed and we've updated `getContract` to reflect those changes and keep it aligned with viem. It's one small code change:

  ```diff
   const worldContract = getContract({
     address: worldAddress,
     abi: IWorldAbi,
  -  publicClient,
  -  walletClient,
  +  client: { public: publicClient, wallet: walletClient },
   });
  ```

### Patch Changes

- 82693072: `waitForIdle` now falls back to `setTimeout` for environments without `requestIdleCallback`.
- d5c0682fb: Updated all human-readable resource IDs to use `{namespace}__{name}` for consistency with world function signatures.
- 01e46d99: Removed some unused files, namely `curry` in `@latticexyz/common` and `useDeprecatedComputedValue` from `@latticexyz/react`.
- 307abab3: `resourceToLabel` now correctly returns just the resource name if its in the root namespace.
- e34d1170: Moved the transaction simulation step to just before sending the transaction in our transaction queue actions (`sendTransaction` and `writeContract`).

  This helps avoid cascading transaction failures for deep queues or when a transaction succeeding depends on the value of the previous.

- db314a74: Upgraded prettier version to 3.2.5 and prettier-plugin-solidity version to 1.3.1.
- Updated dependencies [b38c096d]
- Updated dependencies [d7b1c588a]
  - @latticexyz/schema-type@2.0.0-next.18

## 2.0.0-next.17

### Minor Changes

- aabd3076: Bumped Solidity version to 0.8.24.

### Patch Changes

- a35c05ea: Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
- c162ad5a: Prevented errors not included in the contract (but present in the file) from being included in the interface by `contractToInterface`
- Updated dependencies [aabd3076]
  - @latticexyz/schema-type@2.0.0-next.17

## 2.0.0-next.16

### Patch Changes

- @latticexyz/schema-type@2.0.0-next.16

## 2.0.0-next.15

### Minor Changes

- 1b5eb0d0: Added `unique` and `groupBy` array helpers to `@latticexyz/common/utils`.

  ```ts
  import { unique } from "@latticexyz/common/utils";

  unique([1, 2, 1, 4, 3, 2]);
  // [1, 2, 4, 3]
  ```

  ```ts
  import { groupBy } from "@latticexyz/common/utils";

  const records = [
    { type: "cat", name: "Bob" },
    { type: "cat", name: "Spot" },
    { type: "dog", name: "Rover" },
  ];
  Object.fromEntries(groupBy(records, (record) => record.type));
  // {
  //   "cat": [{ type: "cat", name: "Bob" }, { type: "cat", name: "Spot" }],
  //   "dog: [{ type: "dog", name: "Rover" }]
  // }
  ```

- 4c1dcd81: - Added a `Result<Ok, Err>` type for more explicit and typesafe error handling ([inspired by Rust](https://doc.rust-lang.org/std/result/)).

  - Added a `includes` util as typesafe alternative to [`Array.prototype.includes()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes).

- 5df1f31b: Updated `chunk` types to use readonly arrays

### Patch Changes

- 933b54b5: The benchmark util now logs to `stdout` instead of `stderr`.
- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 5d737cf2: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- Updated dependencies [59054203]
  - @latticexyz/schema-type@2.0.0-next.15

## 2.0.0-next.14

### Patch Changes

- aacffcb5: Pinned prettier-plugin-solidity version to 1.1.3
- Updated dependencies [bb91edaa]
  - @latticexyz/schema-type@2.0.0-next.14

## 2.0.0-next.13

### Minor Changes

- b1d41727: Added a `mapObject` helper to map the value of each property of an object to a new value.

### Patch Changes

- 3e057061: Removed chalk usage from modules imported in client fix downstream client builds (vite in particular).
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Minor Changes

- 06605615: - Added a `sendTransaction` helper to mirror viem's `sendTransaction`, but with our nonce manager
  - Added an internal mempool queue to `sendTransaction` and `writeContract` for better nonce handling
  - Defaults block tag to `pending` for transaction simulation and transaction count (when initializing the nonce manager)
- d2f8e940: Renames `resourceIdToHex` to `resourceToHex` and `hexToResourceId` to `hexToResource`, to better distinguish between a resource ID (hex value) and a resource reference (type, namespace, name).

  ```diff
  - resourceIdToHex({ type: 'table', namespace: '', name: 'Position' });
  + resourceToHex({ type: 'table', namespace: '', name: 'Position' });
  ```

  ```diff
  - hexToResourceId('0x...');
  + hexToResource('0x...');
  ```

  Previous methods still exist but are now deprecated to ease migration and reduce breaking changes. These will be removed in a future version.

  Also removes the previously deprecated and unused table ID utils (replaced by these resource ID utils).

### Patch Changes

- f62c767e: Moved some codegen to use `fs/promises` for better parallelism.
- 25086be5: Replaced temporary `.mudtest` file in favor of `WORLD_ADDRESS` environment variable when running tests with `MudTest` contract
  - @latticexyz/schema-type@2.0.0-next.12

## 2.0.0-next.11

### Minor Changes

- d075f82f: - Moves contract write logic out of `createContract` into its own `writeContract` method so that it can be used outside of the contract instance, and for consistency with viem.

  - Deprecates `createContract` in favor of `getContract` for consistency with viem.
  - Reworks `createNonceManager`'s `BroadcastChannel` setup and moves out the notion of a "nonce manager ID" to `getNonceManagerId` so we can create an internal cache with `getNonceManager` for use in `writeContract`.

  If you were using the `createNonceManager` before, you'll just need to rename `publicClient` argument to `client`:

  ```diff
    const publicClient = createPublicClient({ ... });
  - const nonceManager = createNonceManager({ publicClient, ... });
  + const nonceManager = createNonceManager({ client: publicClient, ... });
  ```

### Patch Changes

- 16b13ea8: Adds viem workaround for zero base fee used by MUD's anvil config
- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8
- Updated dependencies [f99e8898]
  - @latticexyz/schema-type@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.10

## 2.0.0-next.9

### Major Changes

- [#1550](https://github.com/latticexyz/mud/pull/1550) [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e) Thanks [@dk1a](https://github.com/dk1a)! - - Add `renderWithFieldSuffix` helper method to always render a field function with a suffix, and optionally render the same function without a suffix.

  - Remove `methodNameSuffix` from `RenderField` interface, because the suffix is now computed as part of `renderWithFieldSuffix`.

- [#1558](https://github.com/latticexyz/mud/pull/1558) [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f) Thanks [@alvrs](https://github.com/alvrs)! - What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- [#1544](https://github.com/latticexyz/mud/pull/1544) [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae) Thanks [@alvrs](https://github.com/alvrs)! - - `ResourceSelector` is replaced with `ResourceId`, `ResourceIdLib`, `ResourceIdInstance`, `WorldResourceIdLib` and `WorldResourceIdInstance`.

  Previously a "resource selector" was a `bytes32` value with the first 16 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.
  Now a "resource ID" is a `bytes32` value with the first 2 bytes reserved for the resource type, the next 14 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.

  Previously `ResouceSelector` was a library and the resource selector type was a plain `bytes32`.
  Now `ResourceId` is a user type, and the functionality is implemented in the `ResourceIdInstance` (for type) and `WorldResourceIdInstance` (for namespace and name) libraries.
  We split the logic into two libraries, because `Store` now also uses `ResourceId` and needs to be aware of resource types, but not of namespaces/names.

  ```diff
  - import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";
  + import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
  + import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
  + import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

  - bytes32 systemId = ResourceSelector.from("namespace", "name");
  + ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "namespace", "name");

  - using ResourceSelector for bytes32;
  + using WorldResourceIdInstance for ResourceId;
  + using ResourceIdInstance for ResourceId;

    systemId.getName();
    systemId.getNamespace();
  + systemId.getType();

  ```

  - All `Store` and `World` methods now use the `ResourceId` type for `tableId`, `systemId`, `moduleId` and `namespaceId`.
    All mentions of `resourceSelector` were renamed to `resourceId` or the more specific type (e.g. `tableId`, `systemId`)

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IStore {
      function setRecord(
    -   bytes32 tableId,
    +   ResourceId tableId,
        bytes32[] calldata keyTuple,
        bytes calldata staticData,
        PackedCounter encodedLengths,
        bytes calldata dynamicData,
        FieldLayout fieldLayout
      ) external;

      // Same for all other methods
    }
    ```

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IBaseWorld {
      function callFrom(
        address delegator,
    -   bytes32 resourceSelector,
    +   ResourceId systemId,
        bytes memory callData
      ) external payable returns (bytes memory);

      // Same for all other methods
    }
    ```

### Minor Changes

- [#1354](https://github.com/latticexyz/mud/pull/1354) [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853) Thanks [@dk1a](https://github.com/dk1a)! - `readHex` was moved from `@latticexyz/protocol-parser` to `@latticexyz/common`

- [#1566](https://github.com/latticexyz/mud/pull/1566) [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9) Thanks [@dk1a](https://github.com/dk1a)! - - Add `getRemappings` to get foundry remappings as an array of `[to, from]` tuples.

  - Add `extractUserTypes` solidity parser utility to extract user-defined types.
  - Add `loadAndExtractUserTypes` helper to load and parse a solidity file, extracting user-defined types.

- [#1354](https://github.com/latticexyz/mud/pull/1354) [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853) Thanks [@dk1a](https://github.com/dk1a)! - `spliceHex` was added, which has a similar API as JavaScript's [`Array.prototype.splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice), but for `Hex` strings.

  ```ts
  spliceHex("0x123456", 1, 1, "0x0000"); // "0x12000056"
  ```

- [#1473](https://github.com/latticexyz/mud/pull/1473) [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a) Thanks [@holic](https://github.com/holic)! - Bump Solidity version to 0.8.21

- [#1513](https://github.com/latticexyz/mud/pull/1513) [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280) Thanks [@Boffee](https://github.com/Boffee)! - Generated table libraries now have a set of functions prefixed with `_` that always use their own storage for read/write.
  This saves gas for use cases where the functionality to dynamically determine which `Store` to use for read/write is not needed, e.g. root systems in a `World`, or when using `Store` without `World`.

  We decided to continue to always generate a set of functions that dynamically decide which `Store` to use, so that the generated table libraries can still be imported by non-root systems.

  ```solidity
  library Counter {
    // Dynamically determine which store to write to based on the context
    function set(uint32 value) internal;

    // Always write to own storage
    function _set(uint32 value) internal;

    // ... equivalent functions for all other Store methods
  }
  ```

- [#1581](https://github.com/latticexyz/mud/pull/1581) [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b) Thanks [@alvrs](https://github.com/alvrs)! - - The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
  This is to prevent invalid `FieldLayout` values being passed, which could cause the onchain state to diverge from the indexer state.
  However, the internal `StoreCore` library still exposes a `setRecord` and `deleteRecord` method that allows a `FieldLayout` to be passed.
  This is because `StoreCore` can only be used internally, so the `FieldLayout` value can be trusted and we can save the gas for accessing storage.

  ```diff
  interface IStore {
    function setRecord(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      bytes calldata staticData,
      PackedCounter encodedLengths,
      bytes calldata dynamicData,
  -   FieldLayout fieldLayout
    ) external;

    function deleteRecord(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   FieldLayout fieldLayout
    ) external;
  }
  ```

  - The `spliceStaticData` method and `Store_SpliceStaticData` event of `IStore` and `StoreCore` no longer include `deleteCount` in their signature.
    This is because when splicing static data, the data after `start` is always overwritten with `data` instead of being shifted, so `deleteCount` is always the length of the data to be written.

    ```diff

    event Store_SpliceStaticData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
    - uint40 deleteCount,
      bytes data
    );

    interface IStore {
      function spliceStaticData(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
        uint48 start,
    -   uint40 deleteCount,
        bytes calldata data
      ) external;
    }
    ```

  - The `updateInField` method has been removed from `IStore`, as it's almost identical to the more general `spliceDynamicData`.
    If you're manually calling `updateInField`, here is how to upgrade to `spliceDynamicData`:

    ```diff
    - store.updateInField(tableId, keyTuple, fieldIndex, startByteIndex, dataToSet, fieldLayout);
    + uint8 dynamicFieldIndex = fieldIndex - fieldLayout.numStaticFields();
    + store.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, uint40(startByteIndex), uint40(dataToSet.length), dataToSet);
    ```

  - All other methods that are only valid for dynamic fields (`pushToField`, `popFromField`, `getFieldSlice`)
    have been renamed to make this more explicit (`pushToDynamicField`, `popFromDynamicField`, `getDynamicFieldSlice`).

    Their `fieldIndex` parameter has been replaced by a `dynamicFieldIndex` parameter, which is the index relative to the first dynamic field (i.e. `dynamicFieldIndex` = `fieldIndex` - `numStaticFields`).
    The `FieldLayout` parameter has been removed, as it was only used to calculate the `dynamicFieldIndex` in the method.

    ```diff
    interface IStore {
    - function pushToField(
    + function pushToDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        bytes calldata dataToPush,
    -   FieldLayout fieldLayout
      ) external;

    - function popFromField(
    + function popFromDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        uint256 byteLengthToPop,
    -   FieldLayout fieldLayout
      ) external;

    - function getFieldSlice(
    + function getDynamicFieldSlice(
        ResourceId tableId,
        bytes32[] memory keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
    -   FieldLayout fieldLayout,
        uint256 start,
        uint256 end
      ) external view returns (bytes memory data);
    }
    ```

  - `IStore` has a new `getDynamicFieldLength` length method, which returns the byte length of the given dynamic field and doesn't require the `FieldLayout`.

    ```diff
    IStore {
    + function getDynamicFieldLength(
    +   ResourceId tableId,
    +   bytes32[] memory keyTuple,
    +   uint8 dynamicFieldIndex
    + ) external view returns (uint256);
    }

    ```

  - `IStore` now has additional overloads for `getRecord`, `getField`, `getFieldLength` and `setField` that don't require a `FieldLength` to be passed, but instead load it from storage.

  - `IStore` now exposes `setStaticField` and `setDynamicField` to save gas by avoiding the dynamic inference of whether the field is static or dynamic.

  - The `getDynamicFieldSlice` method no longer accepts reading outside the bounds of the dynamic field.
    This is to avoid returning invalid data, as the data of a dynamic field is not deleted when the record is deleted, but only its length is set to zero.

### Patch Changes

- [#1585](https://github.com/latticexyz/mud/pull/1585) [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96) Thanks [@alvrs](https://github.com/alvrs)! - Minor fix to resolving user types: `solc` doesn't like relative imports without `./`, but is fine with relative imports from `./../`, so we always append `./` to the relative path.

- [#1587](https://github.com/latticexyz/mud/pull/1587) [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d) Thanks [@alvrs](https://github.com/alvrs)! - Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.

- [#1598](https://github.com/latticexyz/mud/pull/1598) [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04) Thanks [@dk1a](https://github.com/dk1a)! - Table libraries now correctly handle uninitialized fixed length arrays.

- Updated dependencies [[`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a)]:
  - @latticexyz/schema-type@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.4

## 2.0.0-next.3

### Minor Changes

- [#1311](https://github.com/latticexyz/mud/pull/1311) [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1) Thanks [@alvrs](https://github.com/alvrs)! - Deprecate `@latticexyz/std-client` and remove v1 network dependencies.

  - `getBurnerWallet` is replaced by `getBurnerPrivateKey` from `@latticexyz/common`. It now returns a `Hex` string instead of an `rxjs` `BehaviorSubject`.

    ```
    - import { getBurnerWallet } from "@latticexyz/std-client";
    + import { getBurnerPrivateKey } from "@latticexyz/common";

    - const privateKey = getBurnerWallet().value;
    - const privateKey = getBurnerPrivateKey();
    ```

  - All functions from `std-client` that depended on v1 network code are removed (most notably `setupMUDNetwork` and `setupMUDV2Network`). Consumers should upgrade to v2 networking code from `@latticexyz/store-sync`.

  - The following functions are removed from `std-client` because they are very use-case specific and depend on deprecated code: `getCurrentTurn`, `getTurnAtTime`, `getGameConfig`, `isUntraversable`, `getPlayerEntity`, `resolveRelationshipChain`, `findEntityWithComponentInRelationshipChain`, `findInRelationshipChain`. Consumers should vendor these functions if they are still needed.

  - Remaining exports from `std-client` are moved to `/deprecated`. The package will be removed in a future release (once there are replacements for the deprecated exports).

    ```diff
    - import { ... } from "@latticexyz/std-client";
    + import { ... } from "@latticexyz/std-client/deprecated";
    ```

### Patch Changes

- [#1315](https://github.com/latticexyz/mud/pull/1315) [`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e) Thanks [@holic](https://github.com/holic)! - Initial sync from indexer no longer blocks the promise returning from `createStoreSync`, `syncToRecs`, and `syncToSqlite`. This should help with rendering loading screens using the `SyncProgress` RECS component and avoid the long flashes of no content in templates.

  By default, `syncToRecs` and `syncToSqlite` will start syncing (via observable subscription) immediately after called.

  If your app needs to control when syncing starts, you can use the `startSync: false` option and then `blockStoreOperations$.subscribe()` to start the sync yourself. Just be sure to unsubscribe to avoid memory leaks.

  ```ts
  const { blockStorageOperations$ } = syncToRecs({
    ...
    startSync: false,
  });

  // start sync manually by subscribing to `blockStorageOperation# Change Log
  const subcription = blockStorageOperation$.subscribe();

  // clean up subscription
  subscription.unsubscribe();
  ```

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.3

## 2.0.0-next.2

### Minor Changes

- [#1284](https://github.com/latticexyz/mud/pull/1284) [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad) Thanks [@holic](https://github.com/holic)! - `createContract` now has an `onWrite` callback so you can observe writes. This is useful for wiring up the transanction log in MUD dev tools.

  ```ts
  import { createContract, ContractWrite } from "@latticexyz/common";
  import { Subject } from "rxjs";

  const write$ = new Subject<ContractWrite>();
  creactContract({
    ...
    onWrite: (write) => write$.next(write),
  });
  ```

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - - adds `defaultPriorityFee` to `mudFoundry` for better support with MUD's default anvil config and removes workaround in `createContract`
  - improves nonce error detection using viem's custom errors

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- Updated dependencies [[`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/schema-type@2.0.0-next.2

## 2.0.0-next.1

### Major Changes

- [#1214](https://github.com/latticexyz/mud/pull/1214) [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9) Thanks [@holic](https://github.com/holic)! - Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

  These new sync packages come with support for our `recs` package, including `encodeEntity` and `decodeEntity` utilities for composite keys.

  If you're using `store-cache` and `useRow`/`useRows`, you should wait to upgrade until we have a suitable replacement for those libraries. We're working on a [sql.js](https://github.com/sql-js/sql.js/)-powered sync module that will replace `store-cache`.

  **Migrate existing RECS apps to new sync packages**

  As you migrate, you may find some features replaced, removed, or not included by default. Please [open an issue](https://github.com/latticexyz/mud/issues/new) and let us know if we missed anything.

  1. Add `@latticexyz/store-sync` package to your app's `client` package and make sure `viem` is pinned to version `1.3.1` (otherwise you may get type errors)

  2. In your `supportedChains.ts`, replace `foundry` chain with our new `mudFoundry` chain.

     ```diff
     - import { foundry } from "viem/chains";
     - import { MUDChain, latticeTestnet } from "@latticexyz/common/chains";
     + import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";

     - export const supportedChains: MUDChain[] = [foundry, latticeTestnet];
     + export const supportedChains: MUDChain[] = [mudFoundry, latticeTestnet];
     ```

  3. In `getNetworkConfig.ts`, remove the return type (to let TS infer it for now), remove now-unused config values, and add the viem `chain` object.

     ```diff
     - export async function getNetworkConfig(): Promise<NetworkConfig> {
     + export async function getNetworkConfig() {
     ```

     ```diff
       const initialBlockNumber = params.has("initialBlockNumber")
         ? Number(params.get("initialBlockNumber"))
     -   : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC
     +   : world?.blockNumber ?? 0n;
     ```

     ```diff
     + return {
     +   privateKey: getBurnerWallet().value,
     +   chain,
     +   worldAddress,
     +   initialBlockNumber,
     +   faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
     + };
     ```

  4. In `setupNetwork.ts`, replace `setupMUDV2Network` with `syncToRecs`.

     ```diff
     - import { setupMUDV2Network } from "@latticexyz/std-client";
     - import { createFastTxExecutor, createFaucetService, getSnapSyncRecords } from "@latticexyz/network";
     + import { createFaucetService } from "@latticexyz/network";
     + import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex, parseEther, ClientConfig } from "viem";
     + import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
     + import { createBurnerAccount, createContract, transportObserver } from "@latticexyz/common";
     ```

     ```diff
     - const result = await setupMUDV2Network({
     -   ...
     - });

     + const clientOptions = {
     +   chain: networkConfig.chain,
     +   transport: transportObserver(fallback([webSocket(), http()])),
     +   pollingInterval: 1000,
     + } as const satisfies ClientConfig;

     + const publicClient = createPublicClient(clientOptions);

     + const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
     + const burnerWalletClient = createWalletClient({
     +   ...clientOptions,
     +   account: burnerAccount,
     + });

     + const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
     +   world,
     +   config: storeConfig,
     +   address: networkConfig.worldAddress as Hex,
     +   publicClient,
     +   components: contractComponents,
     +   startBlock: BigInt(networkConfig.initialBlockNumber),
     +   indexerUrl: networkConfig.indexerUrl ?? undefined,
     + });

     + const worldContract = createContract({
     +   address: networkConfig.worldAddress as Hex,
     +   abi: IWorld__factory.abi,
     +   publicClient,
     +   walletClient: burnerWalletClient,
     + });
     ```

     ```diff
       // Request drip from faucet
     - const signer = result.network.signer.get();
     - if (networkConfig.faucetServiceUrl && signer) {
     -   const address = await signer.getAddress();
     + if (networkConfig.faucetServiceUrl) {
     +   const address = burnerAccount.address;
     ```

     ```diff
       const requestDrip = async () => {
     -   const balance = await signer.getBalance();
     +   const balance = await publicClient.getBalance({ address });
         console.info(`[Dev Faucet]: Player balance -> ${balance}`);
     -   const lowBalance = balance?.lte(utils.parseEther("1"));
     +   const lowBalance = balance < parseEther("1");
     ```

     You can remove the previous ethers `worldContract`, snap sync code, and fast transaction executor.

     The return of `setupNetwork` is a bit different than before, so you may have to do corresponding app changes.

     ```diff
     + return {
     +   world,
     +   components,
     +   playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
     +   publicClient,
     +   walletClient: burnerWalletClient,
     +   latestBlock$,
     +   blockStorageOperations$,
     +   waitForTransaction,
     +   worldContract,
     + };
     ```

  5. Update `createSystemCalls` with the new return type of `setupNetwork`.

     ```diff
       export function createSystemCalls(
     -   { worldSend, txReduced$, singletonEntity }: SetupNetworkResult,
     +   { worldContract, waitForTransaction }: SetupNetworkResult,
         { Counter }: ClientComponents
       ) {
          const increment = async () => {
     -      const tx = await worldSend("increment", []);
     -      await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
     +      const tx = await worldContract.write.increment();
     +      await waitForTransaction(tx);
            return getComponentValue(Counter, singletonEntity);
          };
     ```

  6. (optional) If you still need a clock, you can create it with:

     ```ts
     import { map, filter } from "rxjs";
     import { createClock } from "@latticexyz/network";

     const clock = createClock({
       period: 1000,
       initialTime: 0,
       syncInterval: 5000,
     });

     world.registerDisposer(() => clock.dispose());

     latestBlock$
       .pipe(
         map((block) => Number(block.timestamp) * 1000), // Map to timestamp in ms
         filter((blockTimestamp) => blockTimestamp !== clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
         filter((blockTimestamp) => blockTimestamp !== clock.currentTime), // Ignore if the current local timestamp is correct
       )
       .subscribe(clock.update); // Update the local clock
     ```

  If you're using the previous `LoadingState` component, you'll want to migrate to the new `SyncProgress`:

  ```ts
  import { SyncStep, singletonEntity } from "@latticexyz/store-sync/recs";

  const syncProgress = useComponentValue(SyncProgress, singletonEntity, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
  });

  if (syncProgress.step === SyncStep.LIVE) {
    // we're live!
  }
  ```

- [#1258](https://github.com/latticexyz/mud/pull/1258) [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7) Thanks [@holic](https://github.com/holic)! - Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

- [#1261](https://github.com/latticexyz/mud/pull/1261) [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb) Thanks [@holic](https://github.com/holic)! - Add utils for using viem with MUD

  - `createContract` is a wrapper around [viem's `getContract`](https://viem.sh/docs/contract/getContract.html) but with better nonce handling for faster executing of transactions. It has the same arguments and return type as `getContract`.
  - `createNonceManager` helps track local nonces, used by `createContract`.

  Also renames `mudTransportObserver` to `transportObserver`.

### Minor Changes

- [#1245](https://github.com/latticexyz/mud/pull/1245) [`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50) Thanks [@holic](https://github.com/holic)! - Add utils for using viem with MUD

  - `mudFoundry` chain with a transaction request formatter that temporarily removes max fees to work better with anvil `--base-fee 0`
  - `createBurnerAccount` that also temporarily removes max fees during transaction signing to work better with anvil `--base-fee 0`
  - `mudTransportObserver` that will soon let MUD Dev Tools observe transactions

  You can use them like:

  ```ts
  import { createBurnerAccount, mudTransportObserver } from "@latticexyz/common";
  import { mudFoundry } from "@latticexyz/common/chains";

  createWalletClient({
    account: createBurnerAccount(privateKey),
    chain: mudFoundry,
    transport: mudTransportObserver(http()),
    pollingInterval: 1000,
  });
  ```

- [#1266](https://github.com/latticexyz/mud/pull/1266) [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983) Thanks [@holic](https://github.com/holic)! - - Moves zero gas fee override to `createContract` until https://github.com/wagmi-dev/viem/pull/963 or similar feature lands
  - Skip simulation if `gas` is provided

### Patch Changes

- [#1271](https://github.com/latticexyz/mud/pull/1271) [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb) Thanks [@holic](https://github.com/holic)! - - Remove need for tx queue in `createContract`

- [#1210](https://github.com/latticexyz/mud/pull/1210) [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3) Thanks [@dk1a](https://github.com/dk1a)! - - Refactor tightcoder to use typescript functions instead of ejs
  - Optimize `TightCoder` library
  - Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers
- Updated dependencies [[`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07)]:
  - @latticexyz/schema-type@2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#1173](https://github.com/latticexyz/mud/pull/1173) [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee) Thanks [@holic](https://github.com/holic)! - `TableId.toHex()` now truncates name/namespace to 16 bytes each, to properly fit into a `bytes32` hex string.

  Also adds a few utils we'll need in the indexer:

  - `bigIntMin` is similar to `Math.min` but for `bigint`s
  - `bigIntMax` is similar to `Math.max` but for `bigint`s
  - `bigIntSort` for sorting an array of `bigint`s
  - `chunk` to split an array into chunks
  - `wait` returns a `Promise` that resolves after specified number of milliseconds

### Patch Changes

- [#1153](https://github.com/latticexyz/mud/pull/1153) [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f) Thanks [@dk1a](https://github.com/dk1a)! - Clean up Memory.sol, make mcopy pure

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f)]:
  - @latticexyz/schema-type@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.
