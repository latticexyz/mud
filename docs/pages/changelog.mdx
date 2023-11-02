## Version 2.0.0-next.13

Release date: Thu Nov 02 2023

### Major changes

**[feat(utils): remove hash utils and ethers (#1783)](https://github.com/latticexyz/mud/commit/52182f70d350bb99cdfa6054cd6d181e58a91aa6)** (@latticexyz/utils)

Removed `keccak256` and `keccak256Coord` hash utils in favor of [viem's `keccak256`](https://viem.sh/docs/utilities/keccak256.html#keccak256).

```diff
- import { keccak256 } from "@latticexyz/utils";
+ import { keccak256, toHex } from "viem";

- const hash = keccak256("some string");
+ const hash = keccak256(toHex("some string"));
```

```diff
- import { keccak256Coord } from "@latticexyz/utils";
+ import { encodeAbiParameters, keccak256, parseAbiParameters } from "viem";

  const coord = { x: 1, y: 1 };
- const hash = keccak256Coord(coord);
+ const hash = keccak256(encodeAbiParameters(parseAbiParameters("int32, int32"), [coord.x, coord.y]));
```

**[feat(store-indexer,store-sync): filter by table and key (#1794)](https://github.com/latticexyz/mud/commit/f6d214e3d79f9591fddd3687aa987a57f417256c)** (@latticexyz/store-indexer)

Removed `tableIds` filter option in favor of the more flexible `filters` option that accepts `tableId` and an optional `key0` and/or `key1` to filter data by tables and keys.

If you were using an indexer client directly, you'll need to update your query:

```diff
  await indexer.findAll.query({
    chainId,
    address,
-   tableIds: ['0x...'],
+   filters: [{ tableId: '0x...' }],
  });
```

**[feat(create-mud): move react template to zustand, add react-ecs template (#1851)](https://github.com/latticexyz/mud/commit/78949f2c939ff5f743c026367c5978cb459f6f88)** (create-mud)

Replaced the `react` template with a basic task list app using the new Zustand storage adapter and sync method. This new template better demonstrates the different ways of building with MUD and has fewer concepts to learn (i.e. just tables and records, no more ECS).

For ECS-based React apps, you can use `react-ecs` template for the previous RECS storage adapter.

### Minor changes

**[feat(create-mud): replace concurrently with mprocs (#1862)](https://github.com/latticexyz/mud/commit/6288f9033b5f26124ab0ae3cde5934a7aef50f95)** (create-mud)

Updated templates to use [mprocs](https://github.com/pvolok/mprocs) instead of [concurrently](https://github.com/open-cli-tools/concurrently) for running dev scripts.

**[feat(store-sync): extra table definitions (#1840)](https://github.com/latticexyz/mud/commit/de47d698f031a28ef8d9e329e3cffc85e904c6a1)** (@latticexyz/store-sync)

Added an optional `tables` option to `syncToRecs` to allow you to sync from tables that may not be expressed by your MUD config. This will be useful for namespaced tables used by [ERC20](https://github.com/latticexyz/mud/pull/1789) and [ERC721](https://github.com/latticexyz/mud/pull/1844) token modules until the MUD config gains [namespace support](https://github.com/latticexyz/mud/issues/994).

Here's how we use this in our example project with the `KeysWithValue` module:

```ts
syncToRecs({
  ...
  tables: {
    KeysWithValue: {
      namespace: "keywval",
      name: "Inventory",
      tableId: resourceToHex({ type: "table", namespace: "keywval", name: "Inventory" }),
      keySchema: {
        valueHash: { type: "bytes32" },
      },
      valueSchema: {
        keysWithValue: { type: "bytes32[]" },
      },
    },
  },
  ...
});
```

**[feat(world-modules): add ERC721 module (#1844)](https://github.com/latticexyz/mud/commit/d7325e517ce18597d55e8bce41036e78e00c3a78)** (@latticexyz/world-modules)

Added the `ERC721Module` to `@latticexyz/world-modules`.
This module allows the registration of `ERC721` tokens in an existing World.

Important note: this module has not been audited yet, so any production use is discouraged for now.

````solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";

// The ERC721 module requires the Puppet module to be installed first
world.installModule(new PuppetModule(), new bytes(0));

// After the Puppet module is installed, new ERC721 tokens can be registered
IERC721Mintable token = registerERC721(world, "myERC721", ERC721MetadataData({ name: "Token", symbol: "TKN", baseURI: "" }));```
````

**[feat(world-modules): add puppet module (#1793)](https://github.com/latticexyz/mud/commit/35348f831b923aed6e9bdf8b38bf337f3e944a48)** (@latticexyz/world-modules)

Added the `PuppetModule` to `@latticexyz/world-modules`. The puppet pattern allows an external contract to be registered as an external interface for a MUD system.
This allows standards like `ERC20` (that require a specific interface and events to be emitted by a unique contract) to be implemented inside a MUD World.

The puppet serves as a proxy, forwarding all calls to the implementation system (also called the "puppet master").
The "puppet master" system can emit events from the puppet contract.

```solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { createPuppet } from "@latticexyz/world-modules/src/modules/puppet/createPuppet.sol";

// Install the puppet module
world.installModule(new PuppetModule(), new bytes(0));

// Register a new puppet for any system
// The system must implement the `CustomInterface`,
// and the caller must own the system's namespace
CustomInterface puppet = CustomInterface(createPuppet(world, <systemId>));
```

**[feat(create-mud): enable MUD CLI debug logs (#1861)](https://github.com/latticexyz/mud/commit/b68e1699b52714561c9ac62fa593d0b6cd9fe656)** (create-mud)

Enabled MUD CLI debug logs for all templates.

**[feat(store-indexer,store-sync): filter by table and key (#1794)](https://github.com/latticexyz/mud/commit/f6d214e3d79f9591fddd3687aa987a57f417256c)** (@latticexyz/store-sync)

Added a `filters` option to store sync to allow filtering client data on tables and keys. Previously, it was only possible to filter on `tableIds`, but the new filter option allows for more flexible filtering by key.

If you are building a large MUD application, you can use positional keys as a way to shard data and make it possible to load only the data needed in the client for a particular section of your app. We're using this already in Sky Strife to load match-specific data into match pages without having to load data for all matches, greatly improving load time and client performance.

```ts
syncToRecs({
  ...
  filters: [{ tableId: '0x...', key0: '0x...' }],
});
```

The `tableIds` option is now deprecated and will be removed in the future, but is kept here for backwards compatibility.

**[feat(world-modules): add ERC20 module (#1789)](https://github.com/latticexyz/mud/commit/83638373450af5d8f703a183a74107ef7efb4152)** (@latticexyz/world-modules)

Added the `ERC20Module` to `@latticexyz/world-modules`.
This module allows the registration of `ERC20` tokens in an existing World.

Important note: this module has not been audited yet, so any production use is discouraged for now.

```solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";

// The ERC20 module requires the Puppet module to be installed first
world.installModule(new PuppetModule(), new bytes(0));

// After the Puppet module is installed, new ERC20 tokens can be registered
IERC20Mintable token = registerERC20(world, "myERC20", ERC20MetadataData({ decimals: 18, name: "Token", symbol: "TKN" }));
```

**[feat(store-sync): sync to zustand (#1843)](https://github.com/latticexyz/mud/commit/fa77635839e760a9de5fc8959ee492b7a4d8a7cd)** (@latticexyz/store-sync)

Added a Zustand storage adapter and corresponding `syncToZustand` method for use in vanilla and React apps. It's used much like the other sync methods, except it returns a bound store and set of typed tables.

```ts
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import config from "contracts/mud.config";

const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
  config,
  ...
});

// in vanilla apps
const positions = useStore.getState().getRecords(tables.Position);

// in React apps
const positions = useStore((state) => state.getRecords(tables.Position));
```

This change will be shortly followed by an update to our templates that uses Zustand as the default client data store and sync method.

**[feat(store): add experimental config resolve helper (#1826)](https://github.com/latticexyz/mud/commit/b1d41727d4b1964ad3cd907c1c2126b02172b413)** (@latticexyz/common)

Added a `mapObject` helper to map the value of each property of an object to a new value.

### Patch changes

**[fix(create-mud): set store address in PostDeploy script (#1817)](https://github.com/latticexyz/mud/commit/c5148da763645e0adc1250245ea447904014bef2)** (create-mud)

Updated templates' PostDeploy script to set store address so that tables can be used directly inside PostDeploy.

**[fix(create-mud): workaround create-create-app templating (#1863)](https://github.com/latticexyz/mud/commit/1b33a915c56247599c19c5de04090b776b87d561)** (create-mud)

Fixed an issue when creating a new project from the `react` app, where React's expressions were overlapping with Handlebars expressions (used by our template command).

**[fix(cli): change import order so .env file is loaded first (#1860)](https://github.com/latticexyz/mud/commit/21a626ae9bd79f1a275edc70b43d19ed43f48131)** (@latticexyz/cli)

Changed `mud` CLI import order so that environment variables from the `.env` file are loaded before other imports.

**[fix(common,config): remove chalk usage (#1824)](https://github.com/latticexyz/mud/commit/3e057061da17dd2d0c5fd23e6f5a027bdf9a9223)** (@latticexyz/common, @latticexyz/config)

Removed chalk usage from modules imported in client fix downstream client builds (vite in particular).

---

## Version 2.0.0-next.12

Release date: Fri Oct 20 2023

### Major changes

**[feat(store): default off storeArgument (#1741)](https://github.com/latticexyz/mud/commit/7ce82b6fc6bbf390ae159fe990d5d4fca5a4b0cb)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world-modules, @latticexyz/world, create-mud)

Store config now defaults `storeArgument: false` for all tables. This means that table libraries, by default, will no longer include the extra functions with the `_store` argument. This default was changed to clear up the confusion around using table libraries in tests, `PostDeploy` scripts, etc.

If you are sure you need to manually specify a store when interacting with tables, you can still manually toggle it back on with `storeArgument: true` in the table settings of your MUD config.

If you want to use table libraries in `PostDeploy.s.sol`, you can add the following lines:

```diff
  import { Script } from "forge-std/Script.sol";
  import { console } from "forge-std/console.sol";
  import { IWorld } from "../src/codegen/world/IWorld.sol";
+ import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

  contract PostDeploy is Script {
    function run(address worldAddress) external {
+     StoreSwitch.setStoreAddress(worldAddress);
+
+     SomeTable.get(someKey);
```

**[feat(cli): declarative deployment (#1702)](https://github.com/latticexyz/mud/commit/29c3f5087017dbc9dc2c9160e10bfbac5806741f)** (@latticexyz/cli)

`deploy`, `test`, `dev-contracts` were overhauled using a declarative deployment approach under the hood. Deploys are now idempotent and re-running them will introspect the world and figure out the minimal changes necessary to bring the world into alignment with its config: adding tables, adding/upgrading systems, changing access control, etc.

The following CLI arguments are now removed from these commands:

- `--debug` (you can now adjust CLI output with `DEBUG` environment variable, e.g. `DEBUG=mud:*`)
- `--priorityFeeMultiplier` (now calculated automatically)
- `--disableTxWait` (everything is now parallelized with smarter nonce management)
- `--pollInterval` (we now lean on viem defaults and we don't wait/poll until the very end of the deploy)

Most deployment-in-progress logs are now behind a [debug](https://github.com/debug-js/debug) flag, which you can enable with a `DEBUG=mud:*` environment variable.

**[feat(world-modules): only install modules once (#1756)](https://github.com/latticexyz/mud/commit/6ca1874e02161c8feb08b5fafb20b57ce0c8fe72)** (@latticexyz/world-modules)

Modules now revert with `Module_AlreadyInstalled` if attempting to install more than once with the same calldata.

This is a temporary workaround for our deploy pipeline. We'll make these install steps more idempotent in the future.

### Minor changes

**[docs(world): add changeset for system call helpers (#1747)](https://github.com/latticexyz/mud/commit/7fa2ca1831234b54a55c20632d29877e5e711eb7)** (@latticexyz/world)

Added TS helpers for calling systems dynamically via the World.

- `encodeSystemCall` for `world.call`

  ```ts
  worldContract.write.call(encodeSystemCall({
    abi: worldContract.abi,
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }));
  ```

- `encodeSystemCallFrom` for `world.callFrom`

  ```ts
  worldContract.write.callFrom(encodeSystemCallFrom({
    abi: worldContract.abi,
    from: "0x...",
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }));
  ```

- `encodeSystemCalls` for `world.batchCall`

  ```ts
  worldContract.write.batchCall(encodeSystemCalls(abi, [{
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }]));
  ```

- `encodeSystemCallsFrom` for `world.batchCallFrom`
  ```ts
  worldContract.write.batchCallFrom(encodeSystemCallsFrom(abi, "0x...", [{
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }]));
  ```

**[feat(world-modules): only install modules once (#1756)](https://github.com/latticexyz/mud/commit/6ca1874e02161c8feb08b5fafb20b57ce0c8fe72)** (@latticexyz/world)

Added a `Module_AlreadyInstalled` error to `IModule`.

**[feat(common): add sendTransaction, add mempool queue to nonce manager (#1717)](https://github.com/latticexyz/mud/commit/0660561545910b03f8358e5ed7698f74e64f955b)** (@latticexyz/common)

- Added a `sendTransaction` helper to mirror viem's `sendTransaction`, but with our nonce manager
- Added an internal mempool queue to `sendTransaction` and `writeContract` for better nonce handling
- Defaults block tag to `pending` for transaction simulation and transaction count (when initializing the nonce manager)

**[feat(cli): add `--alwaysPostDeploy` flag to deploys (#1765)](https://github.com/latticexyz/mud/commit/ccc21e91387cb09de9dc56729983776eb9bcdcc4)** (@latticexyz/cli)

Added a `--alwaysRunPostDeploy` flag to deploys (`deploy`, `test`, `dev-contracts` commands) to always run `PostDeploy.s.sol` script after each deploy. By default, `PostDeploy.s.sol` is only run once after a new world is deployed.

This is helpful if you want to continue a deploy that may not have finished (due to an error or otherwise) or to run deploys with an idempotent `PostDeploy.s.sol` script.

**[feat(abi-ts): move logs to debug (#1736)](https://github.com/latticexyz/mud/commit/ca32917519eb9065829f11af105abbbb31d6efa2)** (@latticexyz/abi-ts)

Moves log output behind a debug flag. You can enable logging with `DEBUG=abi-ts` environment variable.

**[feat(cli): remove forge clean from deploy (#1759)](https://github.com/latticexyz/mud/commit/e667ee808b5362ff215ba3faea028b526660eccb)** (@latticexyz/cli)

CLI `deploy`, `test`, `dev-contracts` no longer run `forge clean` before each deploy. We previously cleaned to ensure no outdated artifacts were checked into git (ABIs, typechain types, etc.). Now that all artifacts are gitignored, we can let forge use its cache again.

**[feat(common): clarify resourceId (hex) from resource (object) (#1706)](https://github.com/latticexyz/mud/commit/d2f8e940048e56d9be204bf5b2cbcf8d29cc1dee)** (@latticexyz/common)

Renames `resourceIdToHex` to `resourceToHex` and `hexToResourceId` to `hexToResource`, to better distinguish between a resource ID (hex value) and a resource reference (type, namespace, name).

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

**[feat(cli): remove .mudtest file in favor of env var (#1722)](https://github.com/latticexyz/mud/commit/25086be5f34d7289f21395595ac8a6aeabfe9b7c)** (@latticexyz/cli, @latticexyz/common, @latticexyz/world)

Replaced temporary `.mudtest` file in favor of `WORLD_ADDRESS` environment variable when running tests with `MudTest` contract

**[feat(faucet,store-indexer): add k8s healthcheck endpoints (#1739)](https://github.com/latticexyz/mud/commit/1d0f7e22b7fb8f6295b149a6584933a3a657ec08)** (@latticexyz/faucet, @latticexyz/store-indexer)

Added `/healthz` and `/readyz` healthcheck endpoints for Kubernetes

**[feat(cli): add retries to deploy (#1766)](https://github.com/latticexyz/mud/commit/e1dc88ebe7f66e4ece13805643e932e038863b6e)** (@latticexyz/cli)

Transactions sent via deploy will now be retried a few times before giving up. This hopefully helps with large deploys on some chains.

### Patch changes

**[fix(cli): don't bail dev-contracts during deploy failure (#1808)](https://github.com/latticexyz/mud/commit/3bfee32cf4d036a73b35f059e0159f1b7a7088e9)** (@latticexyz/cli)

`dev-contracts` will no longer bail when there was an issue with deploying (e.g. typo in contracts) and instead wait for file changes before retrying.

**[feat(store): parallelize table codegen (#1754)](https://github.com/latticexyz/mud/commit/f62c767e7ff3bda807c592d85227221a00dd9353)** (@latticexyz/store)

Parallelized table codegen. Also put logs behind debug flag, which can be enabled using the `DEBUG=mud:*` environment variable.

**[fix(cli): handle module already installed (#1769)](https://github.com/latticexyz/mud/commit/4e2a170f9185a03c2c504912e3d738f06b45137b)** (@latticexyz/cli)

Deploys now continue if they detect a `Module_AlreadyInstalled` revert error.

**[fix(cli): deploy systems/modules before registering/installing them (#1767)](https://github.com/latticexyz/mud/commit/61c6ab70555dc29e8e9428212ee710d7af681cc9)** (@latticexyz/cli)

Changed deploy order so that system/module contracts are fully deployed before registering/installing them on the world.

**[fix(cli): run worldgen with deploy (#1807)](https://github.com/latticexyz/mud/commit/69d55ce3265e10a1ae62ddca9e32e34f1cd52dea)** (@latticexyz/cli)

Deploy commands (`deploy`, `dev-contracts`, `test`) now correctly run `worldgen` to generate system interfaces before deploying.

**[feat(store): parallelize table codegen (#1754)](https://github.com/latticexyz/mud/commit/f62c767e7ff3bda807c592d85227221a00dd9353)** (@latticexyz/common)

Moved some codegen to use `fs/promises` for better parallelism.

**[fix(cli): support enums in deploy, only deploy modules/systems once (#1749)](https://github.com/latticexyz/mud/commit/4fe079309fae04ffd2e611311937906f65bf91e6)** (@latticexyz/cli)

Fixed a few issues with deploys:

- properly handle enums in MUD config
- only deploy each unique module/system once
- waits for transactions serially instead of in parallel, to avoid RPC errors

**[feat(cli,create-mud): use forge cache (#1777)](https://github.com/latticexyz/mud/commit/d844cd441c40264ddc90d023e4354adea617febd)** (@latticexyz/cli, create-mud)

Sped up builds by using more of forge's cache.

Previously we'd build only what we needed because we would check in ABIs and other build artifacts into git, but that meant that we'd get a lot of forge cache misses. Now that we no longer need these files visible, we can take advantage of forge's caching and greatly speed up builds, especially incremental ones.

**[feat(cli): declarative deployment (#1702)](https://github.com/latticexyz/mud/commit/29c3f5087017dbc9dc2c9160e10bfbac5806741f)** (@latticexyz/world)

With [resource types in resource IDs](https://github.com/latticexyz/mud/pull/1544), the World config no longer requires table and system names to be unique.

**[feat(common): clarify resourceId (hex) from resource (object) (#1706)](https://github.com/latticexyz/mud/commit/d2f8e940048e56d9be204bf5b2cbcf8d29cc1dee)** (@latticexyz/cli, @latticexyz/dev-tools, @latticexyz/store-sync)

Moved to new resource ID utils.

---

## Version 2.0.0-next.11

### Major changes

**[feat(cli): remove backup/restore/force options from set-version (#1687)](https://github.com/latticexyz/mud/commit/3d0b3edb46b266fccb40e26e8243d7628bea8baf)** (@latticexyz/cli)

Removes `.mudbackup` file handling and `--backup`, `--restore`, and `--force` options from `mud set-version` command.

To revert to a previous MUD version, use `git diff` to find the version that you changed from and want to revert to and run `pnpm mud set-version <prior-version>` again.

### Minor changes

**[feat(world-modules): add SystemSwitch util (#1665)](https://github.com/latticexyz/mud/commit/9352648b19800f28b1d96ec448283808342a41f7)** (@latticexyz/world-modules)

Since [#1564](https://github.com/latticexyz/mud/pull/1564) the World can no longer call itself via an external call.
This made the developer experience of calling other systems via root systems worse, since calls from root systems are executed from the context of the World.
The recommended approach is to use `delegatecall` to the system if in the context of a root system, and an external call via the World if in the context of a non-root system.
To bring back the developer experience of calling systems from other sysyems without caring about the context in which the call is executed, we added the `SystemSwitch` util.

```diff
- // Instead of calling the system via an external call to world...
- uint256 value = IBaseWorld(_world()).callMySystem();

+ // ...you can now use the `SystemSwitch` util.
+ // This works independent of whether used in a root system or non-root system.
+ uint256 value = abi.decode(SystemSwitch.call(abi.encodeCall(IBaseWorld.callMySystem, ()), (uint256));
```

Note that if you already know your system is always executed as non-root system, you can continue to use the approach of calling other systems via the `IBaseWorld(world)`.

**[refactor(common): move `createContract`'s internal write logic to `writeContract` (#1693)](https://github.com/latticexyz/mud/commit/d075f82f30f4969a353e4ea29ca2a25a04810523)** (@latticexyz/common)

- Moves contract write logic out of `createContract` into its own `writeContract` method so that it can be used outside of the contract instance, and for consistency with viem.
- Deprecates `createContract` in favor of `getContract` for consistency with viem.
- Reworks `createNonceManager`'s `BroadcastChannel` setup and moves out the notion of a "nonce manager ID" to `getNonceManagerId` so we can create an internal cache with `getNonceManager` for use in `writeContract`.

If you were using the `createNonceManager` before, you'll just need to rename `publicClient` argument to `client`:

```diff
  const publicClient = createPublicClient({ ... });
- const nonceManager = createNonceManager({ publicClient, ... });
+ const nonceManager = createNonceManager({ client: publicClient, ... });
```

**[feat(gas-reporter): allow gas-reporter to parse stdin (#1688)](https://github.com/latticexyz/mud/commit/4385c5a4c0e2d5550c041acc4386ae7fc1cb4b7e)** (@latticexyz/gas-report)

Allow the `gas-report` CLI to parse logs via `stdin`, so it can be used with custom test commands (e.g. `mud test`).

Usage:

```sh
# replace `forge test -vvv` with the custom test command
GAS_REPORTER_ENABLED=true forge test -vvv | pnpm gas-report --stdin
```

### Patch changes

**[feat(store-sync): export postgres column type helpers (#1699)](https://github.com/latticexyz/mud/commit/08d7c471f9a2f4d6c237641eea316313d010373c)** (@latticexyz/store-sync)

Export postgres column type helpers from `@latticexyz/store-sync`.

**[fix(common): workaround for zero base fee (#1689)](https://github.com/latticexyz/mud/commit/16b13ea8fc5e7f63ce08bc6baa2087cab9c8089f)** (@latticexyz/common)

Adds viem workaround for zero base fee used by MUD's anvil config

**[fix(world): register store namespace during initialization (#1712)](https://github.com/latticexyz/mud/commit/430e6b29a9207122d48e386925bdb9fc12c201b9)** (@latticexyz/world)

Register the `store` namespace in the `CoreModule`.
Since namespaces are a World concept, registering the Store's internal tables does not automatically register the Store's namespace, so we do this manually during initialization in the `CoreModule`.

**[build: bump viem and abitype (#1684)](https://github.com/latticexyz/mud/commit/f99e889872e6881bf32bcb9a605b8b5c1b05fac4)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/faucet, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, create-mud)

Bump viem to 1.14.0 and abitype to 0.9.8

**[feat(gas-report): add more logs to stdin piping (#1694)](https://github.com/latticexyz/mud/commit/ba17bdab5c8b2a3aa56e86722134174e2799ddfa)** (@latticexyz/gas-report)

Pass through `stdin` logs in `gas-report`. Since the script piping in logs to `gas-report` can be long-running, it is useful to see its logs to know if it's stalling.

**[fix(protocol-parser): allow arbitrary key order when encoding values (#1674)](https://github.com/latticexyz/mud/commit/a2f41ade977a5374c400ef8bfc2cb8c8698f185e)** (@latticexyz/protocol-parser)

Allow arbitrary key order when encoding values

---

## Version 2.0.0-next.10

### Major changes

**[refactor(world): expose library for WorldContextConsumer (#1624)](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29)** (@latticexyz/world-modules, @latticexyz/world)

We now expose a `WorldContextConsumerLib` library with the same functionality as the `WorldContextConsumer` contract, but the ability to be used inside of internal libraries.
We also renamed the `WorldContextProvider` library to `WorldContextProviderLib` for consistency.

### Minor changes

**[docs: changeset for indexer/store sync table IDs param (#1662)](https://github.com/latticexyz/mud/commit/4081493b84ab5c78a5147d4af8d41fc2d9e027a5)** (@latticexyz/store-indexer, @latticexyz/store-sync)

Added a `tableIds` parameter to store sync methods and indexer to allow filtering data streams by table IDs. Store sync methods automatically include all internal table IDs from Store and World.

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";
import { resourceIdToHex } from "@latticexyz/common";

syncToRecs({
  ...
  tableIds: [resourceIdToHex(...)],
});
```

```ts
import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
import { resourceIdToHex } from "@latticexyz/common";

const client = createIndexerClient({ ... });
client.findAll({
  ...
  tableIds: [resourceIdToHex(...)],
});
```

**[feat(world): return world address from WorldFactory (#1675)](https://github.com/latticexyz/mud/commit/7987c94d61a2c759916a708774db9f3cf08edca8)** (@latticexyz/world)

Return address of the newly created World from `WorldFactory.deployWorld`.

### Patch changes

**[fix(cli): fix table IDs for module install (#1663)](https://github.com/latticexyz/mud/commit/87235a21b28fc831b5fb7a1546835ef08bd51655)** (@latticexyz/cli)

Fix table IDs for module install step of deploy

**[fix(cli): register namespace with namespaceId (#1619)](https://github.com/latticexyz/mud/commit/1d403962283c5b5f62410867be01f6adff277f41)** (@latticexyz/cli)

We fixed a bug in the deploy script that would cause the deployment to fail if a non-root namespace was used in the config.

---

## Version 2.0.0-next.9

### Major changes

**[feat(world): move interfaces/factories to root (#1606)](https://github.com/latticexyz/mud/commit/77dce993a12989dc58534ccf1a8928b156be494a)** (@latticexyz/world)

Moves World interfaces and factories files for consistency with our other packages.

If you import any World interfaces or factories directly, you'll need to update the import path:

```diff
- import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/IBaseWorld.sol";
```

```diff
- import { IBaseWorld } from "@latticexyz/world/src/factories/WorldFactory.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/WorldFactory.sol";
```

**[feat(world): prevent the `World` from calling itself (#1563)](https://github.com/latticexyz/mud/commit/748f4588a218928bca041760448c26991c0d8033)** (@latticexyz/world)

All `World` methods now revert if the `World` calls itself.
The `World` should never need to externally call itself, since all internal table operations happen via library calls, and all root system operations happen via delegate call.

It should not be possible to make the `World` call itself as an external actor.
If it were possible to make the `World` call itself, it would be possible to write to internal tables that only the `World` should have access to.
As this is a very important invariance, we made it explicit in a requirement check in every `World` method, rather than just relying on making it impossible to trigger the `World` to call itself.

This is a breaking change for modules that previously used external calls to the `World` in the `installRoot` method.
In the `installRoot` method, the `World` can only be called via `delegatecall`, and table operations should be performed via the internal table methods (e.g. `_set` instead of `set`).

Example for how to replace external calls to `world` in root systems / root modules (`installRoot`) with `delegatecall`:

```diff
+ import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

- world.grantAccess(tableId, address(hook));
+ (bool success, bytes memory returnData) = address(world).delegatecall(
+   abi.encodeCall(world.grantAccess, (tableId, address(hook)))
+ );

+ if (!success) revertWithBytes(returnData);
```

**[feat: rename schema to valueSchema (#1482)](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9)** (@latticexyz/cli, @latticexyz/protocol-parser, @latticexyz/store-sync, @latticexyz/store, create-mud)

Renamed all occurrences of `schema` where it is used as "value schema" to `valueSchema` to clearly distinguish it from "key schema".
The only breaking change for users is the change from `schema` to `valueSchema` in `mud.config.ts`.

```diff
// mud.config.ts
export default mudConfig({
  tables: {
    CounterTable: {
      keySchema: {},
-     schema: {
+     valueSchema: {
        value: "uint32",
      },
    },
  }
}
```

**[refactor(world): move codegen files (#1592)](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07)** (@latticexyz/cli, @latticexyz/world-modules, @latticexyz/world)

Tables and interfaces in the `world` package are now generated to the `codegen` folder.
This is only a breaking change if you imported tables or codegenerated interfaces from `@latticexyz/world` directly.
If you're using the MUD CLI, the changed import paths are already integrated and no further changes are necessary.

```diff
- import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

```

**[refactor(store): always render field methods with suffix and conditionally without (#1550)](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e)** (@latticexyz/common)

- Add `renderWithFieldSuffix` helper method to always render a field function with a suffix, and optionally render the same function without a suffix.
- Remove `methodNameSuffix` from `RenderField` interface, because the suffix is now computed as part of `renderWithFieldSuffix`.

**[feat(store,): add splice events (#1354)](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853)** (@latticexyz/store, @latticexyz/world)

We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

If you've written your own sync logic or are interacting with Store calls directly, this is a breaking change. We have a few more breaking protocol changes upcoming, so you may hold off on upgrading until those land.

If you are using MUD's built-in tooling (table codegen, indexer, store sync, etc.), you don't have to make any changes except upgrading to the latest versions and deploying a fresh World.

- The `data` field in each `StoreSetRecord` and `StoreEphemeralRecord` has been replaced with three new fields: `staticData`, `encodedLengths`, and `dynamicData`. This better reflects the on-chain state and makes it easier to perform modifications to the raw bytes. We recommend storing each of these fields individually in your off-chain storage of choice (indexer, client, etc.).

  ```diff
  - event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
  + event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);

  - event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
  + event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);
  ```

- The `StoreSetField` event is now replaced by two new events: `StoreSpliceStaticData` and `StoreSpliceDynamicData`. Splicing allows us to perform efficient operations like push and pop, in addition to replacing a field value. We use two events because updating a dynamic-length field also requires updating the record's `encodedLengths` (aka PackedCounter).

  ```diff
  - event StoreSetField(bytes32 tableId, bytes32[] keyTuple, uint8 fieldIndex, bytes data);
  + event StoreSpliceStaticData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data);
  + event StoreSpliceDynamicData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data, bytes32 encodedLengths);
  ```

Similarly, Store setter methods (e.g. `setRecord`) have been updated to reflect the `data` to `staticData`, `encodedLengths`, and `dynamicData` changes. We'll be following up shortly with Store getter method changes for more gas efficient storage reads.

**[refactor(store): change argument order on `Store_SpliceDynamicData` and hooks for consistency (#1589)](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2)** (@latticexyz/store)

The argument order on `Store_SpliceDynamicData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` has been changed to match the argument order on `Store_SetRecord`,
where the `PackedCounter encodedLength` field comes before the `bytes dynamicData` field.

```diff
IStore {
  event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes data,
-   PackedCounter encodedLengths
  );
}

IStoreHook {
  function onBeforeSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes memory data,
-   PackedCounter encodedLengths
  ) external;

  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes memory data,
-   PackedCounter encodedLengths
  ) external;
}
```

**[feat(store,): add splice events (#1354)](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853)** (@latticexyz/common, @latticexyz/protocol-parser)

`readHex` was moved from `@latticexyz/protocol-parser` to `@latticexyz/common`

**[feat(store,world): move hooks to bit flags (#1527)](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8)** (@latticexyz/store, @latticexyz/world)

Moved the registration of store hooks and systems hooks to bitmaps with bitwise operator instead of a struct.

```diff
- import { StoreHookLib } from "@latticexyz/src/StoreHook.sol";
+ import {
+   BEFORE_SET_RECORD,
+   BEFORE_SET_FIELD,
+   BEFORE_DELETE_RECORD
+ } from "@latticexyz/store/storeHookTypes.sol";

  StoreCore.registerStoreHook(
    tableId,
    subscriber,
-   StoreHookLib.encodeBitmap({
-     onBeforeSetRecord: true,
-     onAfterSetRecord: false,
-     onBeforeSetField: true,
-     onAfterSetField: false,
-     onBeforeDeleteRecord: true,
-     onAfterDeleteRecord: false
-   })
+   BEFORE_SET_RECORD | BEFORE_SET_FIELD | BEFORE_DELETE_RECORD
  );
```

```diff
- import { SystemHookLib } from "../src/SystemHook.sol";
+ import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "../src/systemHookTypes.sol";

  world.registerSystemHook(
    systemId,
    subscriber,
-   SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
+   BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM
  );

```

**[feat(store,world): add splice hooks, expose spliceStaticData, spliceDynamicData (#1531)](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4)** (@latticexyz/store, @latticexyz/world)

- The `IStoreHook` interface was changed to replace `onBeforeSetField` and `onAfterSetField` with `onBeforeSpliceStaticData`, `onAfterSpliceStaticData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData`.

  This new interface matches the new `StoreSpliceStaticData` and `StoreSpliceDynamicData` events, and avoids having to read the entire field from storage when only a subset of the field was updated
  (e.g. when pushing elements to a field).

  ```diff
  interface IStoreHook {
  - function onBeforeSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  - function onAfterSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  + function onBeforeSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onAfterSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onBeforeSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;

  + function onAfterSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;
  }
  ```

- All `calldata` parameters on the `IStoreHook` interface were changed to `memory`, since the functions are called with `memory` from the `World`.

- `IStore` exposes two new functions: `spliceStaticData` and `spliceDynamicData`.

  These functions provide lower level access to the operations happening under the hood in `setField`, `pushToField`, `popFromField` and `updateInField` and simplify handling
  the new splice hooks.

  `StoreCore`'s internal logic was simplified to use the `spliceStaticData` and `spliceDynamicData` functions instead of duplicating similar logic in different functions.

  ```solidity
  interface IStore {
    // Splice data in the static part of the record
    function spliceStaticData(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes calldata data
    ) external;

    // Splice data in the dynamic part of the record
    function spliceDynamicData(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
      bytes calldata data
    ) external;
  }
  ```

**[feat: replace Schema with FieldLayout for contract internals (#1336)](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e)** (@latticexyz/cli, @latticexyz/protocol-parser, @latticexyz/store, @latticexyz/world)

- Add `FieldLayout`, which is a `bytes32` user-type similar to `Schema`.

  Both `FieldLayout` and `Schema` have the same kind of data in the first 4 bytes.

  - 2 bytes for total length of all static fields
  - 1 byte for number of static size fields
  - 1 byte for number of dynamic size fields

  But whereas `Schema` has `SchemaType` enum in each of the other 28 bytes, `FieldLayout` has static byte lengths in each of the other 28 bytes.

- Replace `Schema valueSchema` with `FieldLayout fieldLayout` in Store and World contracts.

  `FieldLayout` is more gas-efficient because it already has lengths, and `Schema` has types which need to be converted to lengths.

- Add `getFieldLayout` to `IStore` interface.

  There is no `FieldLayout` for keys, only for values, because key byte lengths aren't usually relevant on-chain. You can still use `getKeySchema` if you need key types.

- Add `fieldLayoutToHex` utility to `protocol-parser` package.

- Add `constants.sol` for constants shared between `FieldLayout`, `Schema` and `PackedCounter`.

**[refactor: separate data into staticData, encodedLengths, dynamicData in getRecord (#1532)](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623)** (@latticexyz/store, @latticexyz/world)

Store's `getRecord` has been updated to return `staticData`, `encodedLengths`, and `dynamicData` instead of a single `data` blob, to match the new behaviour of Store setter methods.

If you use codegenerated libraries, you will only need to update `encode` calls.

```diff
- bytes memory data = Position.encode(x, y);
+ (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Position.encode(x, y);
```

**[feat(world): add `FunctionSignatures` offchain table (#1575)](https://github.com/latticexyz/mud/commit/e5d208e40b2b2fae223b48716ce3f62c530ea1ca)** (@latticexyz/cli, @latticexyz/world)

The `registerRootFunctionSelector` function's signature was changed to accept a `string functionSignature` parameter instead of a `bytes4 functionSelector` parameter.
This change enables the `World` to store the function signatures of all registered functions in a `FunctionSignatures` offchain table, which will allow for the automatic generation of interfaces for a given `World` address in the future.

```diff
IBaseWorld {
  function registerRootFunctionSelector(
    ResourceId systemId,
-   bytes4 worldFunctionSelector,
+   string memory worldFunctionSignature,
    bytes4 systemFunctionSelector
  ) external returns (bytes4 worldFunctionSelector);
}
```

**[feat: move forge build + abi + abi-ts to out (#1483)](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab)** (@latticexyz/store, @latticexyz/world)

Store and World contract ABIs are now exported from the `out` directory. You'll need to update your imports like:

```diff
- import IBaseWorldAbi from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorldAbi.json";
+ import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorldAbi.json";
```

`MudTest.sol` was also moved to the World package. You can update your import like:

```diff
- import { MudTest } from "@latticexyz/store/src/MudTest.sol";
+ import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
```

**[feat(common,store): add support for user-defined types (#1566)](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9)** (@latticexyz/store)

These breaking changes only affect store utilities, you aren't affected if you use `@latticexyz/cli` codegen scripts.

- Add `remappings` argument to the `tablegen` codegen function, so that it can read user-provided files.
- In `RenderTableOptions` change the type of `imports` from `RelativeImportDatum` to `ImportDatum`, to allow passing absolute imports to the table renderer.
- Add `solidityUserTypes` argument to several functions that need to resolve user or abi types: `resolveAbiOrUserType`, `importForAbiOrUserType`, `getUserTypeInfo`.
- Add `userTypes` config option to MUD config, which takes user types mapped to file paths from which to import them.

**[refactor(store): always render field methods with suffix and conditionally without (#1550)](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e)** (@latticexyz/store)

- Always render field methods with a suffix in tablegen (they used to not be rendered if field methods without a suffix were rendered).
- Add `withSuffixlessFieldMethods` to `RenderTableOptions`, which indicates that field methods without a suffix should be rendered.

**[refactor(store,world): move around interfaces and base contracts (#1602)](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840)** (@latticexyz/store, @latticexyz/world)

- Moves Store events into its own `IStoreEvents` interface
- Moves Store interfaces to their own files
- Adds a `StoreData` abstract contract to initialize a Store and expose the Store version

If you're using MUD out of the box, you won't have to make any changes. You will only need to update if you're using any of the base Store interfaces.

**[feat(world): change registerFunctionSelector signature to accept system signature as a single string (#1574)](https://github.com/latticexyz/mud/commit/31ffc9d5d0a6d030cc61349f0f8fbcf6748ebc48)** (@latticexyz/cli, @latticexyz/world)

The `registerFunctionSelector` function now accepts a single `functionSignature` string paramemer instead of separating function name and function arguments into separate parameters.

```diff
IBaseWorld {
  function registerFunctionSelector(
    ResourceId systemId,
-   string memory systemFunctionName,
-   string memory systemFunctionArguments
+   string memory systemFunctionSignature
  ) external returns (bytes4 worldFunctionSelector);
}
```

This is a breaking change if you were manually registering function selectors, e.g. in a `PostDeploy.s.sol` script or a module.
To upgrade, simply replace the separate `systemFunctionName` and `systemFunctionArguments` parameters with a single `systemFunctionSignature` parameter.

```diff
  world.registerFunctionSelector(
    systemId,
-   systemFunctionName,
-   systemFunctionArguments,
+   string(abi.encodePacked(systemFunctionName, systemFunctionArguments))
  );
```

**[feat(store,world): replace `ResourceSelector` with `ResourceId` and `WorldResourceId` (#1544)](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae)** (@latticexyz/world)

All `World` methods acting on namespaces as resources have been updated to use `ResourceId namespaceId` as parameter instead of `bytes14 namespace`.
The reason for this change is to make it clearer when a namespace is used as resource, as opposed to being part of another resource's ID.

```diff
+ import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

IBaseWorld {
- function registerNamespace(bytes14 namespace) external;
+ function registerNamespace(ResourceId namespaceId) external;

- function transferOwnership(bytes14 namespace, address newOwner) external;
+ function transferOwnership(ResourceId namespaceId, address newOwner) external;

- function transferBalanceToNamespace(bytes14 fromNamespace, bytes14 toNamespace, uint256 amount) external;
+ function transferBalanceToNamespace(ResourceId fromNamespaceId, ResourceId toNamespaceId, uint256 amount) external;

- function transferBalanceToAddress(bytes14 fromNamespace, address toAddress, uint256 amount) external;
+ function transferBalanceToAddress(ResourceId fromNamespaceId, address toAddress, uint256 amount) external;
}

```

**[feat: bump solidity to 0.8.21 (#1473)](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a)** (@latticexyz/cli, @latticexyz/common, @latticexyz/gas-report, @latticexyz/noise, @latticexyz/schema-type, @latticexyz/store, @latticexyz/world, create-mud)

Bump Solidity version to 0.8.21

**[feat(world): add `batchCallFrom` (#1594)](https://github.com/latticexyz/mud/commit/5741d53d0a39990a0d7b2842f1f012973655e060)** (@latticexyz/world)

- `IBaseWorld` now has a `batchCallFrom` method, which allows system calls via `callFrom` to be executed in batch.

```solidity
import { SystemCallFromData } from "@latticexyz/world/modules/core/types.sol";

interface IBaseWorld {
  function batchCallFrom(SystemCallFromData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```

- The `callBatch` method of `IBaseWorld` has been renamed to `batchCall` to align better with the `batchCallFrom` method.

```diff
interface IBaseWorld {
- function callBatch(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
+ function batchCall(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```

**[feat(store): codegen index and common files (#1318)](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130)** (@latticexyz/cli, @latticexyz/store, create-mud)

Renamed the default filename of generated user types from `Types.sol` to `common.sol` and the default filename of the generated table index file from `Tables.sol` to `index.sol`.

Both can be overridden via the MUD config:

```ts
export default mudConfig({
  /** Filename where common user types will be generated and imported from. */
  userTypesFilename: "common.sol",
  /** Filename where codegen index will be generated. */
  codegenIndexFilename: "index.sol",
});
```

Note: `userTypesFilename` was renamed from `userTypesPath` and `.sol` is not appended automatically anymore but needs to be part of the provided filename.

To update your existing project, update all imports from `Tables.sol` to `index.sol` and all imports from `Types.sol` to `common.sol`, or override the defaults in your MUD config to the previous values.

```diff
- import { Counter } from "../src/codegen/Tables.sol";
+ import { Counter } from "../src/codegen/index.sol";
- import { ExampleEnum } from "../src/codegen/Types.sol";
+ import { ExampleEnum } from "../src/codegen/common.sol";
```

**[feat(store,): add splice events (#1354)](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853)** (@latticexyz/dev-tools, @latticexyz/store-sync, create-mud)

We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

As such, we've replaced `blockStorageOperations$` with `storedBlockLogs$`, a stream of simplified Store event logs after they've been synced to the configured storage adapter. These logs may not reflect exactly the events that are on chain when e.g. hydrating from an indexer, but they will still allow the client to "catch up" to the on-chain state of your tables.

**[feat(store,world): replace `ephemeral` tables with `offchain` tables (#1558)](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/store-sync, @latticexyz/store, create-mud)

What used to be known as `ephemeral` table is now called `offchain` table.
The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

```diff
- EphemeralTable.emitEphemeral(value);
+ OffchainTable.set(value);
```

**[refactor(store,world): move store tables to `store` namespace, world tables to `world` namespace (#1601)](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70)** (@latticexyz/store-sync, @latticexyz/store, @latticexyz/world-modules, @latticexyz/world)

Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).

**[feat(store): rename events for readability and consistency with errors (#1577)](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c)** (@latticexyz/block-logs-stream, @latticexyz/dev-tools, @latticexyz/store-sync, @latticexyz/store)

`Store` events have been renamed for consistency and readability.
If you're parsing `Store` events manually, you need to update your ABI.
If you're using the MUD sync stack, the new events are already integrated and no further changes are necessary.

```diff
- event StoreSetRecord(
+ event Store_SetRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    bytes32 encodedLengths,
    bytes dynamicData
  );
- event StoreSpliceStaticData(
+ event Store_SpliceStaticData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data
  );
- event StoreSpliceDynamicData(
+ event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data,
    bytes32 encodedLengths
  );
- event StoreDeleteRecord(
+ event Store_DeleteRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple
  );
```

**[feat(store,world): replace `ResourceSelector` with `ResourceId` and `WorldResourceId` (#1544)](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae)** (@latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/store)

- `ResourceSelector` is replaced with `ResourceId`, `ResourceIdLib`, `ResourceIdInstance`, `WorldResourceIdLib` and `WorldResourceIdInstance`.

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

**[feat(store): indexed `tableId` in store events (#1520)](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380)** (@latticexyz/store)

Store events now use an `indexed` `tableId`. This adds ~100 gas per write, but means we our sync stack can filter events by table.

**[feat(world,store): add initialize method, initialize core tables in core module (#1472)](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf)** (@latticexyz/store)

- `StoreCore`'s `initialize` function is split into `initialize` (to set the `StoreSwitch`'s `storeAddress`) and `registerCoreTables` (to register the `Tables` and `StoreHooks` tables).
  The purpose of this is to give consumers more granular control over the setup flow.

- The `StoreRead` contract no longer calls `StoreCore.initialize` in its constructor.
  `StoreCore` consumers are expected to call `StoreCore.initialize` and `StoreCore.registerCoreTable` in their own setup logic.

**[feat(store): add `internalType` property to user types config for type inference (#1587)](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d)** (@latticexyz/cli, @latticexyz/common, @latticexyz/store)

Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.

**[refactor(world,world-modules): move optional modules from `world` to `world-modules` package (#1591)](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23)** (@latticexyz/cli, @latticexyz/world, @latticexyz/world-modules)

All optional modules have been moved from `@latticexyz/world` to `@latticexyz/world-modules`.
If you're using the MUD CLI, the import is already updated and no changes are necessary.

**[feat(store,world): polish store methods (#1581)](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

- The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
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

### Minor changes

**[feat(dev-tools): update actions to display function name instead of callFrom (#1497)](https://github.com/latticexyz/mud/commit/24a0dd4440d6fe661640c581ff5348d62eae9302)** (@latticexyz/dev-tools)

Improved rendering of transactions that make calls via World's `call` and `callFrom` methods

**[feat(faucet): add faucet service (#1517)](https://github.com/latticexyz/mud/commit/9940fdb3e036e03aa8ede1ca80cd44d86d3b85b7)** (@latticexyz/faucet)

New package to run your own faucet service. We'll use this soon for our testnet in place of `@latticexyz/services`.

To run the faucet server:

- Add the package with `pnpm add @latticexyz/faucet`
- Add a `.env` file that has a `RPC_HTTP_URL` and `FAUCET_PRIVATE_KEY` (or pass the environment variables into the next command)
- Run `pnpm faucet-server` to start the server

You can also adjust the server's `HOST` (defaults to `0.0.0.0`) and `PORT` (defaults to `3002`). The tRPC routes are accessible under `/trpc`.

To connect a tRPC client, add the package with `pnpm add @latticexyz/faucet` and then use `createClient`:

```ts
import { createClient } from "@latticexyz/faucet";

const faucet = createClient({ url: "http://localhost:3002/trpc" });

await faucet.mutate.drip({ address: burnerAccount.address });
```

**[feat(world): add `registerNamespaceDelegation` for namespace-bound fallback delegation controls (#1590)](https://github.com/latticexyz/mud/commit/1f80a0b52a5c2d051e3697d6e60aad7364b0a925)** (@latticexyz/world)

It is now possible for namespace owners to register a fallback delegation control system for the namespace.
This fallback delegation control system is used to verify a delegation in `IBaseWorld.callFrom`, after the user's individual and fallback delegations have been checked.

```solidity
IBaseWorld {
  function registerNamespaceDelegation(
    ResourceId namespaceId,
    ResourceId delegationControlId,
    bytes memory initCallData
  ) external;
}
```

**[feat: move forge build + abi + abi-ts to out (#1483)](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab)** (create-mud)

Templates now use `out` for their `forge build` artifacts, including ABIs. If you have a project created from a previous template, you can update your `packages/contracts/package.json` with:

```diff
- "build:abi": "rimraf abi && forge build --extra-output-files abi --out abi --skip test script MudTest.sol",
- "build:abi-ts": "mud abi-ts --input 'abi/IWorld.sol/IWorld.abi.json' && prettier --write '**/*.abi.json.d.ts'",
+ "build:abi": "forge clean && forge build --skip test script",
+ "build:abi-ts": "mud abi-ts && prettier --write '**/*.abi.json.d.ts'",
```

And your `packages/client/src/mud/setupNetwork` with:

```diff
- import IWorldAbi from "contracts/abi/IWorld.sol/IWorld.abi.json";
+ import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
```

**[feat(common,store): add support for user-defined types (#1566)](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9)** (@latticexyz/common)

- Add `getRemappings` to get foundry remappings as an array of `[to, from]` tuples.
- Add `extractUserTypes` solidity parser utility to extract user-defined types.
- Add `loadAndExtractUserTypes` helper to load and parse a solidity file, extracting user-defined types.

**[feat(store-indexer): run indexers with npx (#1526)](https://github.com/latticexyz/mud/commit/498d05e3604cd422064e5548dc53bec327e936ee)** (@latticexyz/store-indexer)

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

**[feat(store,): add splice events (#1354)](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853)** (@latticexyz/common)

`spliceHex` was added, which has a similar API as JavaScript's [`Array.prototype.splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice), but for `Hex` strings.

```ts
spliceHex("0x123456", 1, 1, "0x0000"); // "0x12000056"
```

**[feat(protoocl-parser): add valueSchemaToFieldLayoutHex (#1476)](https://github.com/latticexyz/mud/commit/9ff4dd955fd6dca36eb15cfe7e46bb522d2e943b)** (@latticexyz/protocol-parser)

Adds `valueSchemaToFieldLayoutHex` helper

**[feat(store,world): emit Store/World versions (#1511)](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7)** (@latticexyz/store, @latticexyz/world)

Add protocol version with corresponding getter and event on deploy

```solidity
world.worldVersion();
world.storeVersion(); // a World is also a Store
```

```solidity
event HelloWorld(bytes32 indexed worldVersion);
event HelloStore(bytes32 indexed storeVersion);
```

**[feat(store): expose `getStaticField` and `getDynamicField` on `IStore` and use it in codegen tables (#1521)](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world)

`StoreCore` and `IStore` now expose specific functions for `getStaticField` and `getDynamicField` in addition to the general `getField`.
Using the specific functions reduces gas overhead because more optimized logic can be executed.

```solidity
interface IStore {
  /**
   * Get a single static field from the given tableId and key tuple, with the given value field layout.
   * Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
   * Consumers are expected to truncate the returned value as needed.
   */
  function getStaticField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) external view returns (bytes32);

  /**
   * Get a single dynamic field from the given tableId and key tuple at the given dynamic field index.
   * (Dynamic field index = field index - number of static fields)
   */
  function getDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) external view returns (bytes memory);
}
```

**[refactor(store): inline logic in codegenned set method which uses struct (#1542)](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2)** (@latticexyz/store)

Add an optional `namePrefix` argument to `renderRecordData`, to support inlined logic in codegenned `set` method which uses a struct.

**[feat(store): indexed `tableId` in store events (#1520)](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380)** (@latticexyz/cli, @latticexyz/common, @latticexyz/store, @latticexyz/world)

Generated table libraries now have a set of functions prefixed with `_` that always use their own storage for read/write.
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

**[feat(world,store): add initialize method, initialize core tables in core module (#1472)](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf)** (@latticexyz/cli, @latticexyz/world)

- The `World` contract now has an `initialize` function, which can be called once by the creator of the World to install the core module.
  This change allows the registration of all core tables to happen in the `CoreModule`, so no table metadata has to be included in the `World`'s bytecode.

  ```solidity
  interface IBaseWorld {
    function initialize(IModule coreModule) public;
  }
  ```

- The `World` contract now stores the original creator of the `World` in an immutable state variable.
  It is used internally to only allow the original creator to initialize the `World` in a separate transaction.

  ```solidity
  interface IBaseWorld {
    function creator() external view returns (address);
  }
  ```

- The deploy script is updated to use the `World`'s `initialize` function to install the `CoreModule` instead of `registerRootModule` as before.

**[feat(world): add CallBatchSystem to core module (#1500)](https://github.com/latticexyz/mud/commit/95c59b203259c20a6f944c5f9af008b44e2902b6)** (@latticexyz/world)

The `World` now has a `callBatch` method which allows multiple system calls to be batched into a single transaction.

```solidity
import { SystemCallData } from "@latticexyz/world/modules/core/types.sol";

interface IBaseWorld {
  function callBatch(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```

### Patch changes

**[fix(store-indexer): subscribe postgres indexer to stream (#1514)](https://github.com/latticexyz/mud/commit/ed07018b86046fec20786f4752ac98a4175eb5eb)** (@latticexyz/store-indexer)

Fixes postgres indexer stopping sync after it catches up to the latest block.

**[fix: release bytecode on npm and import abi in cli deploy (#1490)](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world)

Include bytecode for `World` and `Store` in npm packages.

**[refactor(store,world): move test table config out of main table config (#1600)](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8)** (@latticexyz/store, @latticexyz/world)

Moved the test tables out of the main config in `world` and `store` and into their own separate config.

**[fix(common): always import relative sol files from ./ (#1585)](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96)** (@latticexyz/common)

Minor fix to resolving user types: `solc` doesn't like relative imports without `./`, but is fine with relative imports from `./../`, so we always append `./` to the relative path.

**[feat(store): compute FieldLayout at compile time (#1508)](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world)

The `FieldLayout` in table libraries is now generated at compile time instead of dynamically in a table library function.
This significantly reduces gas cost in all table library functions.

**[feat(store): add Storage.loadField for optimized loading of 32 bytes or less from storage (#1512)](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c)** (@latticexyz/store)

Added `Storage.loadField` to optimize loading 32 bytes or less from storage (which is always the case when loading data for static fields).

**[refactor(store,world): prefix errors with library/contract name (#1568)](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c)** (@latticexyz/store, @latticexyz/world)

Prefixed all errors with their respective library/contract for improved debugging.

**[refactor(world): remove workaround in mud config (#1501)](https://github.com/latticexyz/mud/commit/4c7fd3eb29e3d3954f2f1f36ace474a436082651)** (@latticexyz/world)

Remove a workaround for the internal `InstalledModules` table that is not needed anymore.

**[feat(world): rename `funcSelectorAndArgs` to `callData` (#1524)](https://github.com/latticexyz/mud/commit/a0341daf9fd87e8072ffa292a33f508dd37b8ca6)** (@latticexyz/world)

Renamed all `funcSelectorAndArgs` arguments to `callData` for clarity.

**[fix(faucet,store-indexer): fix invalid env message (#1546)](https://github.com/latticexyz/mud/commit/301bcb75dd8c15b8ea1a9d0ca8c75c15d7cd92bd)** (@latticexyz/faucet, @latticexyz/store-indexer)

Improves error message when parsing env variables

**[feat(store,world): replace `ResourceSelector` with `ResourceId` and `WorldResourceId` (#1544)](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae)** (@latticexyz/world, @latticexyz/store)

The `ResourceType` table is removed.
It was previously used to store the resource type for each resource ID in a `World`. This is no longer necessary as the [resource type is now encoded in the resource ID](https://github.com/latticexyz/mud/pull/1544).

To still be able to determine whether a given resource ID exists, a `ResourceIds` table has been added.
The previous `ResourceType` table was part of `World` and missed tables that were registered directly via `StoreCore.registerTable` instead of via `World.registerTable` (e.g. when a table was registered as part of a root module).
This problem is solved by the new table `ResourceIds` being part of `Store`.

`StoreCore`'s `hasTable` function was removed in favor of using `ResourceIds.getExists(tableId)` directly.

```diff
- import { ResourceType } from "@latticexyz/world/src/tables/ResourceType.sol";
- import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
+ import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

- bool tableExists = StoreCore.hasTable(tableId);
+ bool tableExists = ResourceIds.getExists(tableId);

- bool systemExists = ResourceType.get(systemId) != Resource.NONE;
+ bool systemExists = ResourceIds.getExists(systemId);
```

**[feat: rename table to tableId (#1484)](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847)** (@latticexyz/block-logs-stream, @latticexyz/store-sync, @latticexyz/store)

Renamed all occurrences of `table` where it is used as "table ID" to `tableId`.
This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

```diff
event StoreSetRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  bytes data
);

event StoreSetField(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  uint8 fieldIndex,
  bytes data
);

event StoreDeleteRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key
);

event StoreEphemeralRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  bytes data
);
```

**[docs: cli changeset after deploy changes (#1503)](https://github.com/latticexyz/mud/commit/bd9cc8ec2608efcb05ef95df64448b2ec28bcb49)** (@latticexyz/cli)

Refactor `deploy` command to break up logic into modules

**[feat: rename key to keyTuple (#1492)](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96)** (@latticexyz/block-logs-stream, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world)

Renamed all occurrences of `key` where it is used as "key tuple" to `keyTuple`.
This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

```diff
event StoreSetRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  bytes data
);

event StoreSetField(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  uint8 fieldIndex,
  bytes data
);

event StoreDeleteRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
);

event StoreEphemeralRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  bytes data
);
```

**[fix(protocol-parser): export valueSchemaToFieldLayoutHex (#1481)](https://github.com/latticexyz/mud/commit/f8a01a047d73a15326ebf6577ea033674d8e61a9)** (@latticexyz/protocol-parser)

Export `valueSchemaToFieldLayoutHex` helper

**[fix(world): register Delegations table in CoreModule (#1452)](https://github.com/latticexyz/mud/commit/f1cd43bf9264d5a23a3edf2a1ea4212361a72203)** (@latticexyz/world)

Register `Delegations` table in the `CoreModule`

**[fix(store-indexer): catch errors when parsing logs to tables and storage operations (#1488)](https://github.com/latticexyz/mud/commit/7e6e5157bb124f19bd8ed9f02b93afadc97cdf50)** (@latticexyz/store-sync)

Catch errors when parsing logs to tables and storage operations, log and skip

**[refactor(store): rename `Utils.sol` to `leftMask.sol` and minor cleanup (#1599)](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619)** (@latticexyz/store)

Minor `Store` cleanups: renamed `Utils.sol` to `leftMask.sol` since it only contains a single free function, and removed a leftover sanity check.

**[feat(store,world): use user-types for `ResourceId`, `FieldLayout` and `Schema` in table libraries (#1586)](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612)** (@latticexyz/store-sync, @latticexyz/store, @latticexyz/world)

All `Store` and `World` tables now use the appropriate user-types for `ResourceId`, `FieldLayout` and `Schema` to avoid manual `wrap`/`unwrap`.

**[feat(store): optimize storage location hash (#1509)](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87)** (@latticexyz/store, @latticexyz/world)

Optimized the `StoreCore` hash function determining the data location to use less gas.

**[fix(dev-tools): key -> keyTuple (#1505)](https://github.com/latticexyz/mud/commit/e0193e5737fa2148d5d2b888d71df01d1e46b6d5)** (@latticexyz/dev-tools)

Updates store event `key` reference to `keyTuple`

**[fix(dev-tools): table -> tableId (#1502)](https://github.com/latticexyz/mud/commit/e0377761c3a3f83a23de78f6bcb0733c500a0825)** (@latticexyz/dev-tools)

Updates `table` reference to `tableId`

**[feat: move forge build + abi + abi-ts to out (#1483)](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab)** (@latticexyz/cli)

`deploy` and `dev-contracts` CLI commands now use `forge build --skip test script` before deploying and run `mud abi-ts` to generate strong types for ABIs.

**[refactor(store-indexer): add readme, refactor common env (#1533)](https://github.com/latticexyz/mud/commit/b3c22a183c0b288b9eb1487e4fef125bf7dae915)** (@latticexyz/store-indexer)

Added README and refactored handling of common environment variables

**[refactor(store,world): simplify constants (#1569)](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7)** (@latticexyz/store, @latticexyz/world)

Simplified a couple internal constants used for bitshifting.

**[docs(faucet): add readme (#1534)](https://github.com/latticexyz/mud/commit/fa409e83db6b76422d525f7d2e9c947dc3c51262)** (@latticexyz/faucet)

Added README

**[fix(common): fix memory corruption for dynamic to static array conversion (#1598)](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04)** (@latticexyz/cli, @latticexyz/common)

Table libraries now correctly handle uninitialized fixed length arrays.

---

## Version 2.0.0-next.8

### Major changes

**[feat(world,store): add ERC165 checks for all registration methods (#1458)](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac)** (@latticexyz/store, @latticexyz/world)

The `World` now performs `ERC165` interface checks to ensure that the `StoreHook`, `SystemHook`, `System`, `DelegationControl` and `Module` contracts to actually implement their respective interfaces before registering them in the World.

The required `supportsInterface` methods are implemented on the respective base contracts.
When creating one of these contracts, the recommended approach is to extend the base contract rather than the interface.

```diff
- import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
+ import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";

- contract MyStoreHook is IStoreHook {}
+ contract MyStoreHook is StoreHook {}
```

```diff
- import { ISystemHook } from "@latticexyz/world/src/interfaces/ISystemHook.sol";
+ import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";

- contract MySystemHook is ISystemHook {}
+ contract MySystemHook is SystemHook {}
```

```diff
- import { IDelegationControl } from "@latticexyz/world/src/interfaces/IDelegationControl.sol";
+ import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";

- contract MyDelegationControl is IDelegationControl {}
+ contract MyDelegationControl is DelegationControl {}
```

```diff
- import { IModule } from "@latticexyz/world/src/interfaces/IModule.sol";
+ import { Module } from "@latticexyz/world/src/Module.sol";

- contract MyModule is IModule {}
+ contract MyModule is Module {}
```

**[feat(world): change requireOwnerOrSelf to requireOwner (#1457)](https://github.com/latticexyz/mud/commit/51914d656d8cd8d851ccc8296d249cf09f53e670)** (@latticexyz/world)

- The access control library no longer allows calls by the `World` contract to itself to bypass the ownership check.
  This is a breaking change for root modules that relied on this mechanism to register root tables, systems or function selectors.
  To upgrade, root modules must use `delegatecall` instead of a regular `call` to install root tables, systems or function selectors.

  ```diff
  - world.registerSystem(rootSystemId, rootSystemAddress);
  + address(world).delegatecall(abi.encodeCall(world.registerSystem, (rootSystemId, rootSystemAddress)));
  ```

- An `installRoot` method was added to the `IModule` interface.
  This method is now called when installing a root module via `world.installRootModule`.
  When installing non-root modules via `world.installModule`, the module's `install` function continues to be called.

**[feat(world): add Balance table and BalanceTransferSystem (#1425)](https://github.com/latticexyz/mud/commit/2ca75f9b9063ea33524e6c609b87f5494f678fa0)** (@latticexyz/world)

The World now maintains a balance per namespace.
When a system is called with value, the value stored in the World contract and credited to the system's namespace.

Previously, the World contract did not store value, but passed it on to the system contracts.
However, as systems are expected to be stateless (reading/writing state only via the calling World) and can be registered in multiple Worlds, this could have led to exploits.

Any address with access to a namespace can use the balance of that namespace.
This allows all systems registered in the same namespace to work with the same balance.

There are two new World methods to transfer balance between namespaces (`transferBalanceToNamespace`) or to an address (`transferBalanceToAddress`).

```solidity
interface IBaseWorld {
  function transferBalanceToNamespace(bytes16 fromNamespace, bytes16 toNamespace, uint256 amount) external;

  function transferBalanceToAddress(bytes16 fromNamespace, address toAddress, uint256 amount) external;
}
```

### Minor changes

**[feat(store,world): add ability to unregister hooks (#1422)](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7)** (@latticexyz/store, @latticexyz/world)

It is now possible to unregister Store hooks and System hooks.

```solidity
interface IStore {
  function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) external;
  // ...
}

interface IWorld {
  function unregisterSystemHook(bytes32 resourceSelector, ISystemHook hookAddress) external;
  // ...
}
```

**[feat(protocol-parser): add keySchema/valueSchema helpers (#1443)](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)** (@latticexyz/store)

Moved `KeySchema`, `ValueSchema`, `SchemaToPrimitives` and `TableRecord` types into `@latticexyz/protocol-parser`

**[feat(protocol-parser): add keySchema/valueSchema helpers (#1443)](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)** (@latticexyz/protocol-parser)

Adds `decodeKey`, `decodeValue`, `encodeKey`, and `encodeValue` helpers to decode/encode from key/value schemas. Deprecates previous methods that use a schema object with static/dynamic field arrays, originally attempting to model our on-chain behavior but ended up not very ergonomic when working with table configs.

---

## Version 2.0.0-next.7

### Major changes

**[feat(store,world): more granularity for onchain hooks (#1399)](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15)** (@latticexyz/store, @latticexyz/world)

- The `onSetRecord` hook is split into `onBeforeSetRecord` and `onAfterSetRecord` and the `onDeleteRecord` hook is split into `onBeforeDeleteRecord` and `onAfterDeleteRecord`.
  The purpose of this change is to allow more fine-grained control over the point in the lifecycle at which hooks are executed.

  The previous hooks were executed before modifying data, so they can be replaced with the respective `onBefore` hooks.

  ```diff
  - function onSetRecord(
  + function onBeforeSetRecord(
      bytes32 table,
      bytes32[] memory key,
      bytes memory data,
      Schema valueSchema
    ) public;

  - function onDeleteRecord(
  + function onBeforeDeleteRecord(
      bytes32 table,
      bytes32[] memory key,
      Schema valueSchema
    ) public;
  ```

- It is now possible to specify which methods of a hook contract should be called when registering a hook. The purpose of this change is to save gas by avoiding to call no-op hook methods.

  ```diff
  function registerStoreHook(
    bytes32 tableId,
  - IStoreHook hookAddress
  + IStoreHook hookAddress,
  + uint8 enabledHooksBitmap
  ) public;

  function registerSystemHook(
    bytes32 systemId,
  - ISystemHook hookAddress
  + ISystemHook hookAddress,
  + uint8 enabledHooksBitmap
  ) public;
  ```

  There are `StoreHookLib` and `SystemHookLib` with helper functions to encode the bitmap of enabled hooks.

  ```solidity
  import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";

  uint8 storeHookBitmap = StoreBookLib.encodeBitmap({
    onBeforeSetRecord: true,
    onAfterSetRecord: true,
    onBeforeSetField: true,
    onAfterSetField: true,
    onBeforeDeleteRecord: true,
    onAfterDeleteRecord: true
  });
  ```

  ```solidity
  import { SystemHookLib } from "@latticexyz/world/src/SystemHook.sol";

  uint8 systemHookBitmap = SystemHookLib.encodeBitmap({
    onBeforeCallSystem: true,
    onAfterCallSystem: true
  });
  ```

- The `onSetRecord` hook call for `emitEphemeralRecord` has been removed to save gas and to more clearly distinguish ephemeral tables as offchain tables.

### Patch changes

**[fix(abi-ts): remove cwd join (#1418)](https://github.com/latticexyz/mud/commit/2459e15fc9bf49fff2d769b9efba07b99635f2cc)** (@latticexyz/abi-ts)

Let `glob` handle resolving the glob against the current working directory.

**[feat(world): allow callFrom from own address without explicit delegation (#1407)](https://github.com/latticexyz/mud/commit/18d3aea55b1d7f4b442c21343795c299a56fc481)** (@latticexyz/world)

Allow `callFrom` with the own address as `delegator` without requiring an explicit delegation

---

## Version 2.0.0-next.6

### Major changes

**[style(gas-report): rename mud-gas-report to gas-report (#1410)](https://github.com/latticexyz/mud/commit/9af542d3e29e2699144534dec3430e19294077d4)** (@latticexyz/gas-report)

Renames `mud-gas-report` binary to `gas-report`, since it's no longer MUD specific.

### Minor changes

**[docs: rework abi-ts changesets (#1413)](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)** (@latticexyz/abi-ts, @latticexyz/cli)

Added a new `@latticexyz/abi-ts` package to generate TS type declaration files (`.d.ts`) for each ABI JSON file.

This allows you to import your JSON ABI and use it directly with libraries like [viem](https://npmjs.com/package/viem) and [abitype](https://npmjs.com/package/abitype).

```
pnpm add @latticexyz/abi-ts
pnpm abi-ts
```

By default, `abi-ts` looks for files with the glob `**/*.abi.json`, but you can customize this glob with the `--input` argument, e.g.

```console
pnpm abi-ts --input 'abi/IWorld.sol/IWorld.abi.json'
```

**[docs: rework abi-ts changesets (#1413)](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)** (create-mud)

We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

If you have a MUD project created from an older template, you can replace TypeChain with `abi-ts` by first updating your contracts' `package.json`:

```diff
-"build": "pnpm run build:mud && pnpm run build:abi && pnpm run build:typechain",
+"build": "pnpm run build:mud && pnpm run build:abi && pnpm run build:abi-ts",
-"build:abi": "forge clean && forge build",
+"build:abi": "rimraf abi && forge build --extra-output-files abi --out abi --skip test script MudTest.sol",
+"build:abi-ts": "mud abi-ts --input 'abi/IWorld.sol/IWorld.abi.json' && prettier --write '**/*.abi.json.d.ts'",
 "build:mud": "mud tablegen && mud worldgen",
-"build:typechain": "rimraf types && typechain --target=ethers-v5 out/IWorld.sol/IWorld.json",
```

And update your client's `setupNetwork.ts` with:

```diff
-import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
+import IWorldAbi from "contracts/abi/IWorld.sol/IWorld.abi.json";

 const worldContract = createContract({
   address: networkConfig.worldAddress as Hex,
-  abi: IWorld__factory.abi,
+  abi: IWorldAbi,
```

**[docs: rework abi-ts changesets (#1413)](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)** (@latticexyz/store, @latticexyz/world)

We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

If you previously relied on TypeChain types from `@latticexyz/store` or `@latticexyz/world`, you will either need to migrate to viem or abitype using ABI JSON imports or generate TypeChain types from our exported ABI JSON files.

```ts
import { getContract } from "viem";
import IStoreAbi from "@latticexyz/store/abi/IStore.sol/IStore.abi.json";

const storeContract = getContract({
  abi: IStoreAbi,
  ...
});

await storeContract.write.setRecord(...);
```

---

## Version 2.0.0-next.5

### Major changes

**[refactor(world): separate call utils into `WorldContextProvider` and `SystemCall` (#1370)](https://github.com/latticexyz/mud/commit/9d0f492a90e5d94c6b38ad732e78fd4b13b2adbe)** (@latticexyz/world)

- The previous `Call.withSender` util is replaced with `WorldContextProvider`, since the usecase of appending the `msg.sender` to the calldata is tightly coupled with `WorldContextConsumer` (which extracts the appended context from the calldata).

  The previous `Call.withSender` utility reverted if the call failed and only returned the returndata on success. This is replaced with `callWithContextOrRevert`/`delegatecallWithContextOrRevert`

  ```diff
  -import { Call } from "@latticexyz/world/src/Call.sol";
  +import { WorldContextProvider } from "@latticexyz/world/src/WorldContext.sol";

  -Call.withSender({
  -  delegate: false,
  -  value: 0,
  -  ...
  -});
  +WorldContextProvider.callWithContextOrRevert({
  +  value: 0,
  +  ...
  +});

  -Call.withSender({
  -  delegate: true,
  -  value: 0,
  -  ...
  -});
  +WorldContextProvider.delegatecallWithContextOrRevert({
  +  ...
  +});
  ```

  In addition there are utils that return a `bool success` flag instead of reverting on errors. This mirrors the behavior of Solidity's low level `call`/`delegatecall` functions and is useful in situations where additional logic should be executed in case of a reverting external call.

  ```solidity
  library WorldContextProvider {
    function callWithContext(
      address target, // Address to call
      bytes memory funcSelectorAndArgs, // Abi encoded function selector and arguments to pass to pass to the contract
      address msgSender, // Address to append to the calldata as context for msgSender
      uint256 value // Value to pass with the call
    ) internal returns (bool success, bytes memory data);

    function delegatecallWithContext(
      address target, // Address to call
      bytes memory funcSelectorAndArgs, // Abi encoded function selector and arguments to pass to pass to the contract
      address msgSender // Address to append to the calldata as context for msgSender
    ) internal returns (bool success, bytes memory data);
  }
  ```

- `WorldContext` is renamed to `WorldContextConsumer` to clarify the relationship between `WorldContextProvider` (appending context to the calldata) and `WorldContextConsumer` (extracting context from the calldata)

  ```diff
  -import { WorldContext } from "@latticexyz/world/src/WorldContext.sol";
  -import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
  ```

- The `World` contract previously had a `_call` method to handle calling systems via their resource selector, performing accesss control checks and call hooks registered for the system.

  ```solidity
  library SystemCall {
    /**
     * Calls a system via its resource selector and perform access control checks.
     * Does not revert if the call fails, but returns a `success` flag along with the returndata.
     */
    function call(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bool success, bytes memory data);

    /**
     * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
     * Does not revert if the call fails, but returns a `success` flag along with the returndata.
     */
    function callWithHooks(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bool success, bytes memory data);

    /**
     * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
     * Reverts if the call fails.
     */
    function callWithHooksOrRevert(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bytes memory data);
  }
  ```

- System hooks now are called with the system's resource selector instead of its address. The system's address can still easily obtained within the hook via `Systems.get(resourceSelector)` if necessary.

  ```diff
  interface ISystemHook {
    function onBeforeCallSystem(
      address msgSender,
  -   address systemAddress,
  +   bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs
    ) external;

    function onAfterCallSystem(
      address msgSender,
  -   address systemAddress,
  +   bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs
    ) external;
  }
  ```

### Minor changes

**[feat(world): add support for upgrading systems (#1378)](https://github.com/latticexyz/mud/commit/ce97426c0d70832e5efdb8bad83207a9d840302b)** (@latticexyz/world)

It is now possible to upgrade systems by calling `registerSystem` again with an existing system id (resource selector).

```solidity
// Register a system
world.registerSystem(systemId, systemAddress, publicAccess);

// Upgrade the system by calling `registerSystem` with the
// same system id but a new system address or publicAccess flag
world.registerSystem(systemId, newSystemAddress, newPublicAccess);
```

**[feat(world): add callFrom entry point (#1364)](https://github.com/latticexyz/mud/commit/1ca35e9a1630a51dfd1e082c26399f76f2cd06ed)** (@latticexyz/world)

The `World` has a new `callFrom` entry point which allows systems to be called on behalf of other addresses if those addresses have registered a delegation.
If there is a delegation, the call is forwarded to the system with `delegator` as `msgSender`.

```solidity
interface IBaseWorld {
  function callFrom(
    address delegator,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs
  ) external payable virtual returns (bytes memory);
}
```

A delegation can be registered via the `World`'s `registerDelegation` function.
If `delegatee` is `address(0)`, the delegation is considered to be a "fallback" delegation and is used in `callFrom` if there is no delegation is found for the specific caller.
Otherwise the delegation is registered for the specific `delegatee`.

```solidity
interface IBaseWorld {
  function registerDelegation(
    address delegatee,
    bytes32 delegationControl,
    bytes memory initFuncSelectorAndArgs
  ) external;
}
```

The `delegationControl` refers to the resource selector of a `DelegationControl` system that must have been registered beforehand.
As part of registering the delegation, the `DelegationControl` system is called with the provided `initFuncSelectorAndArgs`.
This can be used to initialize data in the given `DelegationControl` system.

The `DelegationControl` system must implement the `IDelegationControl` interface:

```solidity
interface IDelegationControl {
  function verify(address delegator, bytes32 systemId, bytes calldata funcSelectorAndArgs) external returns (bool);
}
```

When `callFrom` is called, the `World` checks if a delegation is registered for the given caller, and if so calls the delegation control's `verify` function with the same same arguments as `callFrom`.
If the call to `verify` is successful and returns `true`, the delegation is valid and the call is forwarded to the system with `delegator` as `msgSender`.

Note: if `UNLIMITED_DELEGATION` (from `@latticexyz/world/src/constants.sol`) is passed as `delegationControl`, the external call to the delegation control contract is skipped and the delegation is considered valid.

For examples of `DelegationControl` systems, check out the `CallboundDelegationControl` or `TimeboundDelegationControl` systems in the `std-delegations` module.
See `StandardDelegations.t.sol` for usage examples.

**[feat(world): allow transferring ownership of namespaces (#1274)](https://github.com/latticexyz/mud/commit/c583f3cd08767575ce9df39725ec51195b5feb5b)** (@latticexyz/world)

It is now possible to transfer ownership of namespaces!

```solidity
// Register a new namespace
world.registerNamespace("namespace");
// It's owned by the caller of the function (address(this))

// Transfer ownership of the namespace to address(42)
world.transferOwnership("namespace", address(42));
// It's now owned by address(42)
```

### Patch changes

**[fix(services): correctly export typescript types (#1377)](https://github.com/latticexyz/mud/commit/33f50f8a473398dcc19b17d10a17a552a82678c7)** (@latticexyz/services)

Fixed an issue where the TypeScript types for createFaucetService were not exported correctly from the @latticexyz/services package

**[feat: docker monorepo build (#1219)](https://github.com/latticexyz/mud/commit/80a26419f15177333b523bac5d09767487b4ffef)** (@latticexyz/services)

The build phase of services now works on machines with older protobuf compilers

**[refactor: remove v1 network package, remove snap sync module, deprecate std-client (#1311)](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)** (@latticexyz/common, @latticexyz/store, @latticexyz/world)

- Refactor tightcoder to use typescript functions instead of ejs
- Optimize `TightCoder` library
- Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers

**[fix(cli): make mud test exit with code 1 on test error (#1371)](https://github.com/latticexyz/mud/commit/dc258e6860196ad34bf1d4ac7fce382f70e2c0c8)** (@latticexyz/cli)

The `mud test` cli now exits with code 1 on test failure. It used to exit with code 0, which meant that CIs didn't notice test failures.

---

## Version 2.0.0-next.4

### Major changes

**[docs: changeset for deleted network package (#1348)](https://github.com/latticexyz/mud/commit/42c7d898630c93805a5e345bdc8d87c2674b5110)** (@latticexyz/network)

Removes `network` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

**[chore: delete std-contracts package (#1341)](https://github.com/latticexyz/mud/commit/c32c8e8f2ccac02c4242f715f296bffd5465bd71)** (@latticexyz/cli, @latticexyz/std-contracts)

Removes `std-contracts` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.

**[chore: delete solecs package (#1340)](https://github.com/latticexyz/mud/commit/ce7125a1b97efd3db47c5ea1593d5a37ba143f64)** (@latticexyz/cli, @latticexyz/recs, @latticexyz/solecs, @latticexyz/std-client)

Removes `solecs` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.

**[feat(recs,std-client): move action system to recs (#1351)](https://github.com/latticexyz/mud/commit/c14f8bf1ec8c199902c12899853ac144aa69bb9c)** (@latticexyz/recs, @latticexyz/std-client)

- Moved `createActionSystem` from `std-client` to `recs` package and updated it to better support v2 sync stack.

  If you want to use `createActionSystem` alongside `syncToRecs`, you'll need to pass in arguments like so:

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import { createActionSystem } from "@latticexyz/recs/deprecated";
  import { from, mergeMap } from "rxjs";

  const { blockLogsStorage$, waitForTransaction } = syncToRecs({
    world,
    ...
  });

  const txReduced$ = blockLogsStorage$.pipe(
    mergeMap(({ operations }) => from(operations.map((op) => op.log?.transactionHash).filter(isDefined)))
  );

  const actionSystem = createActionSystem(world, txReduced$, waitForTransaction);
  ```

- Fixed a bug in `waitForComponentValueIn` that caused the promise to not resolve if the component value was already set when the function was called.

- Fixed a bug in `createActionSystem` that caused optimistic updates to be incorrectly propagated to requirement checks. To fix the bug, you must now pass in the full component object to the action's `updates` instead of just the component name.

  ```diff
    actions.add({
      updates: () => [
        {
  -       component: "Resource",
  +       component: Resource,
          ...
        }
      ],
      ...
    });
  ```

**[chore: delete std-client package (#1342)](https://github.com/latticexyz/mud/commit/c03aff39e9882c8a827a3ed1ee81816231973816)** (@latticexyz/std-client)

Removes `std-client` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

**[chore: delete ecs-browser package (#1339)](https://github.com/latticexyz/mud/commit/6255a314240b1d36a8735f3dc7eb1672e16bac1a)** (@latticexyz/ecs-browser)

Removes `ecs-browser` package. This has now been replaced by `dev-tools`, which comes out-of-the-box when creating a new MUD app from the templates (`pnpm create mud@next your-app-name`). We'll be adding deeper RECS support (querying for entities) in a future release.

**[chore: delete store-cache package (#1343)](https://github.com/latticexyz/mud/commit/e3de1a338fe110ac33ba9fb833366541e4cf4cf1)** (@latticexyz/store-cache)

Removes `store-cache` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

If you need reactivity, we recommend using `recs` package and `syncToRecs`. We'll be adding reactivity to `syncToSqlite` in a future release.

**[chore: delete store-cache package (#1343)](https://github.com/latticexyz/mud/commit/e3de1a338fe110ac33ba9fb833366541e4cf4cf1)** (@latticexyz/react)

Removes `useRow` and `useRows` hooks, previously powered by `store-cache`, which is now deprecated. Please use `recs` and the corresponding `useEntityQuery` and `useComponentValue` hooks. We'll have more hooks soon for SQL.js sync backends.

---

## Version 2.0.0-next.3

### Major changes

**[feat(world, store): stop loading schema from storage, require schema as an argument (#1174)](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world, create-mud)

All `Store` methods now require the table's value schema to be passed in as an argument instead of loading it from storage.
This decreases gas cost and removes circular dependencies of the Schema table (where it was not possible to write to the Schema table before the Schema table was registered).

```diff
  function setRecord(
    bytes32 table,
    bytes32[] calldata key,
    bytes calldata data,
+   Schema valueSchema
  ) external;
```

The same diff applies to `getRecord`, `getField`, `setField`, `pushToField`, `popFromField`, `updateInField`, and `deleteRecord`.

This change only requires changes in downstream projects if the `Store` methods were accessed directly. In most cases it is fully abstracted in the generated table libraries,
so downstream projects only need to regenerate their table libraries after updating MUD.

**[refactor(world): combine name and namespace to resource selector in World methods (#1208)](https://github.com/latticexyz/mud/commit/c32a9269a30c1898932ebbf7e3b60e25d1bd884c)** (@latticexyz/cli, @latticexyz/world)

- All `World` function selectors that previously had `bytes16 namespace, bytes16 name` arguments now use `bytes32 resourceSelector` instead.
  This includes `setRecord`, `setField`, `pushToField`, `popFromField`, `updateInField`, `deleteRecord`, `call`, `grantAccess`, `revokeAccess`, `registerTable`,
  `registerStoreHook`, `registerSystemHook`, `registerFunctionSelector`, `registerSystem` and `registerRootFunctionSelector`.
  This change aligns the `World` function selectors with the `Store` function selectors, reduces clutter, reduces gas cost and reduces the `World`'s contract size.

- The `World`'s `registerHook` function is removed. Use `registerStoreHook` or `registerSystemHook` instead.

- The `deploy` script is updated to integrate the World interface changes

**[refactor: remove v1 network package, remove snap sync module, deprecate std-client (#1311)](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)** (@latticexyz/world)

The `SnapSyncModule` is removed. The recommended way of loading the initial state of a MUD app is via the new [`store-indexer`](https://mud.dev/indexer). Loading state via contract getter functions is not recommended, as it's computationally heavy on the RPC, can't be cached, and is an easy way to shoot yourself in the foot with exploding RPC costs.

The `@latticexyz/network` package was deprecated and is now removed. All consumers should upgrade to the new sync stack from `@latticexyz/store-sync`.

**[refactor(store): optimize PackedCounter (#1231)](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db)** (@latticexyz/cli, @latticexyz/protocol-parser, @latticexyz/services, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world)

Reverse PackedCounter encoding, to optimize gas for bitshifts.
Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

- Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
- New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)

**[feat(store,world): combine schema and metadata registration, rename getSchema to getValueSchema, change Schema table id (#1182)](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world, @latticexyz/store-sync, create-mud)

- `Store`'s internal schema table is now a normal table instead of using special code paths. It is renamed to Tables, and the table ID changed from `mudstore:schema` to `mudstore:Tables`
- `Store`'s `registerSchema` and `setMetadata` are combined into a single `registerTable` method. This means metadata (key names, field names) is immutable and indexers can create tables with this metadata when a new table is registered on-chain.

  ```diff
  -  function registerSchema(bytes32 table, Schema schema, Schema keySchema) external;
  -
  -  function setMetadata(bytes32 table, string calldata tableName, string[] calldata fieldNames) external;

  +  function registerTable(
  +    bytes32 table,
  +    Schema keySchema,
  +    Schema valueSchema,
  +    string[] calldata keyNames,
  +    string[] calldata fieldNames
  +  ) external;
  ```

- `World`'s `registerTable` method is updated to match the `Store` interface, `setMetadata` is removed
- The `getSchema` method is renamed to `getValueSchema` on all interfaces
  ```diff
  - function getSchema(bytes32 table) external view returns (Schema schema);
  + function getValueSchema(bytes32 table) external view returns (Schema valueSchema);
  ```
- The `store-sync` and `cli` packages are updated to integrate the breaking protocol changes. Downstream projects only need to manually integrate these changes if they access low level `Store` or `World` functions. Otherwise, a fresh deploy with the latest MUD will get you these changes.

**[refactor: remove v1 network package, remove snap sync module, deprecate std-client (#1311)](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)** (@latticexyz/services, create-mud)

Move `createFaucetService` from `@latticexyz/network` to `@latticexyz/services/faucet`.

```diff
- import { createFaucetService } from "@latticexyz/network";
+ import { createFaucetService } from "@latticexyz/services/faucet";
```

**[refactor: remove v1 network package, remove snap sync module, deprecate std-client (#1311)](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)** (@latticexyz/std-client, @latticexyz/common, create-mud)

Deprecate `@latticexyz/std-client` and remove v1 network dependencies.

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

### Patch changes

**[feat(common,store-sync): improve initial sync to not block returned promise (#1315)](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e)** (@latticexyz/common, @latticexyz/store-sync)

Initial sync from indexer no longer blocks the promise returning from `createStoreSync`, `syncToRecs`, and `syncToSqlite`. This should help with rendering loading screens using the `SyncProgress` RECS component and avoid the long flashes of no content in templates.

By default, `syncToRecs` and `syncToSqlite` will start syncing (via observable subscription) immediately after called.

If your app needs to control when syncing starts, you can use the `startSync: false` option and then `blockStoreOperations$.subscribe()` to start the sync yourself. Just be sure to unsubscribe to avoid memory leaks.

```ts
const { blockStorageOperations$ } = syncToRecs({
  ...
  startSync: false,
});

// start sync manually by subscribing to `blockStorageOperation$`
const subcription = blockStorageOperation$.subscribe();

// clean up subscription
subscription.unsubscribe();
```

**[refactor(store): optimize table libraries (#1303)](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd)** (@latticexyz/store)

Optimize autogenerated table libraries

**[feat(store-sync): add more logging to waitForTransaction (#1317)](https://github.com/latticexyz/mud/commit/3e024fcf395a1c1b38d12362fc98472290eb7cf1)** (@latticexyz/store-sync)

add retry attempts and more logging to `waitForTransaction`

**[refactor(store): optimize Schema (#1252)](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61)** (@latticexyz/store, @latticexyz/world)

Optimize Schema methods.
Return `uint256` instead of `uint8` in SchemaInstance numFields methods

---

## Version 2.0.0-next.2

### Major changes

**[feat(store-indexer): use fastify, move trpc to /trpc (#1232)](https://github.com/latticexyz/mud/commit/b621fb97731a0ceed9b67d741f40648a8aa64817)** (@latticexyz/store-indexer)

Adds a [Fastify](https://fastify.dev/) server in front of tRPC and puts tRPC endpoints under `/trpc` to make way for other top-level endpoints (e.g. [tRPC panel](https://github.com/iway1/trpc-panel) or other API frontends like REST or gRPC).

If you're using `@latticexyz/store-sync` packages with an indexer (either `createIndexerClient` or `indexerUrl` argument of `syncToRecs`), then you'll want to update your indexer URL:

```diff
 createIndexerClient({
-  url: "https://indexer.dev.linfra.xyz",
+  url: "https://indexer.dev.linfra.xyz/trpc",
 });
```

```diff
 syncToRecs({
   ...
-  indexerUrl: "https://indexer.dev.linfra.xyz",
+  indexerUrl: "https://indexer.dev.linfra.xyz/trpc",
 });
```

**[refactor(store): remove TableId library (#1279)](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062)** (@latticexyz/store)

Remove `TableId` library to simplify `store` package

**[feat(create-mud): infer recs components from config (#1278)](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473)** (@latticexyz/cli, @latticexyz/std-client, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

RECS components are now dynamically created and inferred from your MUD config when using `syncToRecs`.

To migrate existing projects after upgrading to this MUD version:

1. Remove `contractComponents.ts` from `client/src/mud`
2. Remove `components` argument from `syncToRecs`
3. Update `build:mud` and `dev` scripts in `contracts/package.json` to remove tsgen

   ```diff
   - "build:mud": "mud tablegen && mud worldgen && mud tsgen --configPath mud.config.ts --out ../client/src/mud",
   + "build:mud": "mud tablegen && mud worldgen",
   ```

   ```diff
   - "dev": "pnpm mud dev-contracts --tsgenOutput ../client/src/mud",
   + "dev": "pnpm mud dev-contracts",
   ```

**[feat: bump viem to 1.6.0 (#1308)](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)** (@latticexyz/block-logs-stream)

- removes our own `getLogs` function now that viem's `getLogs` supports using multiple `events` per RPC call.
- removes `isNonPendingBlock` and `isNonPendingLog` helpers now that viem narrows `Block` and `Log` types based on inputs
- simplifies `groupLogsByBlockNumber` types and tests

**[feat(dev-tools): use new sync stack (#1284)](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad)** (@latticexyz/dev-tools, create-mud)

MUD dev tools is updated to latest sync stack. You must now pass in all of its data requirements rather than relying on magic globals.

```diff
import { mount as mountDevTools } from "@latticexyz/dev-tools";

- mountDevTools();
+ mountDevTools({
+   config,
+   publicClient,
+   walletClient,
+   latestBlock$,
+   blockStorageOperations$,
+   worldAddress,
+   worldAbi,
+   write$,
+   // if you're using recs
+   recsWorld,
+ });
```

It's also advised to wrap dev tools so that it is only mounted during development mode. Here's how you do this with Vite:

```ts
// https://vitejs.dev/guide/env-and-mode.html
if (import.meta.env.DEV) {
  mountDevTools({ ... });
}
```

### Minor changes

**[feat(dev-tools): use new sync stack (#1284)](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad)** (@latticexyz/common)

`createContract` now has an `onWrite` callback so you can observe writes. This is useful for wiring up the transanction log in MUD dev tools.

```ts
import { createContract, ContractWrite } from "@latticexyz/common";
import { Subject } from "rxjs";

const write$ = new Subject<ContractWrite>();
creactContract({
  ...
  onWrite: (write) => write$.next(write),
});
```

**[feat: bump viem to 1.6.0 (#1308)](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)** (@latticexyz/common)

- adds `defaultPriorityFee` to `mudFoundry` for better support with MUD's default anvil config and removes workaround in `createContract`
- improves nonce error detection using viem's custom errors

**[feat(store-sync,store-indexer): consolidate sync logic, add syncToSqlite (#1240)](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e)** (@latticexyz/dev-tools, @latticexyz/store-indexer, @latticexyz/store-sync)

Store sync logic is now consolidated into a `createStoreSync` function exported from `@latticexyz/store-sync`. This simplifies each storage sync strategy to just a simple wrapper around the storage adapter. You can now sync to RECS with `syncToRecs` or SQLite with `syncToSqlite` and PostgreSQL support coming soon.

There are no breaking changes if you were just using `syncToRecs` from `@latticexyz/store-sync` or running the `sqlite-indexer` binary from `@latticexyz/store-indexer`.

**[feat(dev-tools): use new sync stack (#1284)](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad)** (@latticexyz/react)

Adds a `usePromise` hook that returns a [native `PromiseSettledResult` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled).

```tsx
const promise = fetch(url);
const result = usePromise(promise);

if (result.status === "idle" || result.status === "pending") {
  return <>fetching</>;
}

if (result.status === "rejected") {
  return <>error fetching: {String(result.reason)}</>;
}

if (result.status === "fulfilled") {
  return <>fetch status: {result.value.status}</>;
}
```

### Patch changes

**[feat: bump viem to 1.6.0 (#1308)](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)** (@latticexyz/block-logs-stream, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/network, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/std-client, @latticexyz/store-indexer, @latticexyz/store-sync, create-mud)

bump viem to 1.6.0

**[feat(dev-tools): improve support for non-store recs components (#1302)](https://github.com/latticexyz/mud/commit/5294a7d5983c52cb336373566afd6a8ec7fc4bfb)** (@latticexyz/dev-tools, @latticexyz/store-sync)

Improves support for internal/client-only RECS components

**[feat: bump viem to 1.6.0 (#1308)](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)** (@latticexyz/store-sync)

remove usages of `isNonPendingBlock` and `isNonPendingLog` (fixed with more specific viem types)

---

## Version 2.0.0-next.1

### Major changes

**[chore: fix changeset type (#1220)](https://github.com/latticexyz/mud/commit/2f6cfef91daacf09db82a4b7c69cff3af583b8f6)** (@latticexyz/store-indexer, @latticexyz/store-sync)

Adds store indexer service package with utils to query the indexer service.

You can run the indexer locally by checking out the MUD monorepo, installing/building everything, and running `pnpm start:local` from `packages/store-indexer`.

To query the indexer in the client, you can create a tRPC client with a URL pointing to the indexer service and call the available tRPC methods:

```ts
import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";

const indexer = createIndexerClient({ url: indexerUrl });
const result = await indexer.findAll.query({
  chainId: publicClient.chain.id,
  address,
});
```

If you're using `syncToRecs`, you can just pass in the `indexerUrl` option as a shortcut to the above:

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";

syncToRecs({
  ...
  indexerUrl: "https://your.indexer.service",
});
```

**[fix: changeset package name (#1270)](https://github.com/latticexyz/mud/commit/9a7c9009a43bc5691bb33996bcf669711cc51503)** (@latticexyz/cli, @latticexyz/common, @latticexyz/recs, @latticexyz/store-indexer, create-mud)

Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

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
       filter((blockTimestamp) => blockTimestamp !== clock.currentTime) // Ignore if the current local timestamp is correct
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

**[feat(common): replace TableId with tableIdToHex/hexToTableId (#1258)](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7)** (@latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/network, @latticexyz/std-client, @latticexyz/store-sync)

Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

**[feat(common): add createContract, createNonceManager utils (#1261)](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb)** (@latticexyz/common)

Add utils for using viem with MUD

- `createContract` is a wrapper around [viem's `getContract`](https://viem.sh/docs/contract/getContract.html) but with better nonce handling for faster executing of transactions. It has the same arguments and return type as `getContract`.
- `createNonceManager` helps track local nonces, used by `createContract`.

Also renames `mudTransportObserver` to `transportObserver`.

### Minor changes

**[feat(common): add viem utils (#1245)](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50)** (@latticexyz/common)

Add utils for using viem with MUD

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

**[feat(store-indexer,store-sync): make chain optional, configure indexer with RPC (#1234)](https://github.com/latticexyz/mud/commit/131c63e539a8e9947835dcc323c8b37562aed9ca)** (@latticexyz/store-indexer, @latticexyz/store-sync)

- Accept a plain viem `PublicClient` (instead of requiring a `Chain` to be set) in `store-sync` and `store-indexer` functions. These functions now fetch chain ID using `publicClient.getChainId()` when no `publicClient.chain.id` is present.
- Allow configuring `store-indexer` with a set of RPC URLs (`RPC_HTTP_URL` and `RPC_WS_URL`) instead of `CHAIN_ID`.

**[feat(store-sync): export singletonEntity as const, allow startBlock in syncToRecs (#1235)](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b)** (@latticexyz/store-sync)

Export `singletonEntity` as const rather than within the `syncToRecs` result.

```diff
- const { singletonEntity, ... } = syncToRecs({ ... });
+ import { singletonEntity, syncToRecs } from "@latticexyz/store-sync/recs";
+ const { ... } = syncToRecs({ ... });
```

**[feat(schema-type): add type narrowing isStaticAbiType (#1196)](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07)** (@latticexyz/schema-type)

add type narrowing `isStaticAbiType`

**[feat(common): move zero gas fee override to `createContract` (#1266)](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983)** (@latticexyz/common)

- Moves zero gas fee override to `createContract` until https://github.com/wagmi-dev/viem/pull/963 or similar feature lands
- Skip simulation if `gas` is provided

### Patch changes

**[fix(cli): add support for legacy transactions in deploy script (#1178)](https://github.com/latticexyz/mud/commit/168a4cb43ce4f7bfbdb7b1b9d4c305b912a0d3f2)** (@latticexyz/cli)

Add support for legacy transactions in deploy script by falling back to `gasPrice` if `lastBaseFeePerGas` is not available

**[feat: protocol-parser in go (#1116)](https://github.com/latticexyz/mud/commit/3236f799e501be227da6e42e7b41a4928750115c)** (@latticexyz/services)

protocol-parser in Go

**[refactor(store): optimize Storage library (#1194)](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021)** (@latticexyz/store)

Optimize storage library

**[feat(common): remove need for tx queue in `createContract` (#1271)](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb)** (@latticexyz/common)

- Remove need for tx queue in `createContract`

**[feat(store-sync): add block numbers to SyncProgress (#1228)](https://github.com/latticexyz/mud/commit/57a5260830401c9ad93196a895a50b0fc4a86183)** (@latticexyz/store-sync)

Adds `latestBlockNumber` and `lastBlockNumberProcessed` to internal `SyncProgress` component

**[feat(store-sync): sync to RECS (#1197)](https://github.com/latticexyz/mud/commit/9e5baf4fff0c60615b8f2b4645fb11cb78cb0bd8)** (@latticexyz/store-sync)

Add RECS sync strategy and corresponding utils

```ts
import { createPublicClient, http } from 'viem';
import { syncToRecs } from '@latticexyz/store-sync';
import storeConfig from 'contracts/mud.config';
import { defineContractComponents } from './defineContractComponents';

const publicClient = createPublicClient({
  chain,
  transport: http(),
  pollingInterval: 1000,
});

const { components, singletonEntity, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
  world,
  config: storeConfig,
  address: '0x...',
  publicClient,
  components: defineContractComponents(...),
});
```

**[fix(store): align Store event names between IStoreWrite and StoreCore (#1237)](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206)** (@latticexyz/store)

Align Store events parameter naming between IStoreWrite and StoreCore

**[fix(cli): explicit import of world as type (#1206)](https://github.com/latticexyz/mud/commit/e259ef79f4d9026353176d0f74628cae50c2f69b)** (@latticexyz/cli, @latticexyz/std-client)

Generated `contractComponents` now properly import `World` as type

**[feat(store-sync): export singletonEntity as const, allow startBlock in syncToRecs (#1235)](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b)** (@latticexyz/store-sync)

Add `startBlock` option to `syncToRecs`.

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";
import worlds from "contracts/worlds.json";

syncToRecs({
  startBlock: worlds['31337'].blockNumber,
  ...
});
```

**[chore: pin node to 18.16.1 (#1200)](https://github.com/latticexyz/mud/commit/0d1a7e03a0c8258c76d0b4b76a1a558ae07bbf85)** (@latticexyz/network)

Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.

**[feat(cli,recs,std-client): update RECS components with v2 key/value schemas (#1195)](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd)** (@latticexyz/cli, @latticexyz/recs, @latticexyz/std-client)

Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

- `component.id` is now the on-chain `bytes32` hex representation of the table ID
- `component.metadata.componentName` is the table name (e.g. `Position`)
- `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
- `component.metadata.keySchema` is an object with key names and their corresponding ABI types
- `component.metadata.valueSchema` is an object with field names and their corresponding ABI types

**[refactor(store): update tightcoder codegen, optimize TightCoder library (#1210)](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)** (@latticexyz/common, @latticexyz/store, @latticexyz/world)

- Refactor tightcoder to use typescript functions instead of ejs
- Optimize `TightCoder` library
- Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers

---

## Version 2.0.0-next.0

### Minor changes

**[feat(store-sync): add store sync package (#1075)](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9)** (@latticexyz/block-logs-stream, @latticexyz/protocol-parser, @latticexyz/store-sync, @latticexyz/store)

Add store sync package

**[feat(protocol-parser): add abiTypesToSchema (#1100)](https://github.com/latticexyz/mud/commit/b98e51808aaa29f922ac215cf666cf6049e692d6)** (@latticexyz/protocol-parser)

feat: add abiTypesToSchema, a util to turn a list of abi types into a Schema by separating static and dynamic types

**[chore(protocol-parser): add changeset for #1099 (#1111)](https://github.com/latticexyz/mud/commit/ca50fef8108422a121d03571fb4679060bd4891a)** (@latticexyz/protocol-parser)

feat: add `encodeKeyTuple`, a util to encode key tuples in Typescript (equivalent to key tuple encoding in Solidity and inverse of `decodeKeyTuple`).
Example:

```ts
encodeKeyTuple({ staticFields: ["uint256", "int32", "bytes16", "address", "bool", "int8"], dynamicFields: [] }, [
  42n,
  -42,
  "0x12340000000000000000000000000000",
  "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
  true,
  3,
]);
// [
//  "0x000000000000000000000000000000000000000000000000000000000000002a",
//  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
//  "0x1234000000000000000000000000000000000000000000000000000000000000",
//  "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
//  "0x0000000000000000000000000000000000000000000000000000000000000001",
//  "0x0000000000000000000000000000000000000000000000000000000000000003",
// ]
```

**[feat(store-sync): rework blockLogsToStorage (#1176)](https://github.com/latticexyz/mud/commit/eeb15cc06fcbe80c37ba3926d9387f6bd5947234)** (@latticexyz/block-logs-stream, @latticexyz/store-sync)

- Replace `blockEventsToStorage` with `blockLogsToStorage` that exposes a `storeOperations` callback to perform database writes from store operations. This helps encapsulates database adapters into a single wrapper/instance of `blockLogsToStorage` and allows for wrapping a block of store operations in a database transaction.
- Add `toBlock` option to `groupLogsByBlockNumber` and remove `blockHash` from results. This helps track the last block number for a given set of logs when used in the context of RxJS streams.

**[feat(block-logs-stream): add block logs stream package (#1070)](https://github.com/latticexyz/mud/commit/72b806979db6eb2880772193898351d657b94f75)** (@latticexyz/block-logs-stream)

Add block logs stream package

```ts
import { filter, map, mergeMap } from "rxjs";
import { createPublicClient, parseAbi } from "viem";
import {
  createBlockStream,
  isNonPendingBlock,
  groupLogsByBlockNumber,
  blockRangeToLogs,
} from "@latticexyz/block-logs-stream";

const publicClient = createPublicClient({
  // your viem public client config here
});

const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });

const latestBlockNumber$ = latestBlock$.pipe(
  filter(isNonPendingBlock),
  map((block) => block.number)
);

latestBlockNumber$
  .pipe(
    map((latestBlockNumber) => ({ startBlock: 0n, endBlock: latestBlockNumber })),
    blockRangeToLogs({
      publicClient,
      address,
      events: parseAbi([
        "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
        "event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data)",
        "event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)",
        "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data)",
      ]),
    }),
    mergeMap(({ logs }) => from(groupLogsByBlockNumber(logs)))
  )
  .subscribe((block) => {
    console.log("got events for block", block);
  });
```

**[feat(gas-report): create package, move relevant files to it (#1147)](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11)** (@latticexyz/cli, @latticexyz/gas-report, @latticexyz/store)

Create gas-report package, move gas-report cli command and GasReporter contract to it

**[refactor(store,world): replace isStore with storeAddress (#1061)](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda)** (@latticexyz/std-contracts, @latticexyz/store, @latticexyz/world)

Rename `MudV2Test` to `MudTest` and move from `@latticexyz/std-contracts` to `@latticexyz/store`.

```solidity
// old import
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
// new import
import { MudTest } from "@latticexyz/store/src/MudTest.sol";
```

Refactor `StoreSwitch` to use a storage slot instead of `function isStore()` to determine which contract is Store:

- Previously `StoreSwitch` called `isStore()` on `msg.sender` to determine if `msg.sender` is a `Store` contract. If the call succeeded, the `Store` methods were called on `msg.sender`, otherwise the data was written to the own storage.
- With this change `StoreSwitch` instead checks for an `address` in a known storage slot. If the address equals the own address, data is written to the own storage. If it is an external address, `Store` methods are called on this address. If it is unset (`address(0)`), store methods are called on `msg.sender`.
- In practice this has the same effect as before: By default the `World` contracts sets its own address in `StoreSwitch`, while `System` contracts keep the Store address undefined, so `Systems` write to their caller (`World`) if they are executed via `call` or directly to the `World` storage if they are executed via `delegatecall`.
- Besides gas savings, this change has two additional benefits:
  1. it is now possible for `Systems` to explicitly set a `Store` address to make them exclusive to that `Store` and
  2. table libraries can now be used in tests without having to provide an explicit `Store` argument, because the `MudTest` base contract redirects reads and writes to the internal `World` contract.

**[feat(store-sync): sync to sqlite (#1185)](https://github.com/latticexyz/mud/commit/69a96f109065ae2564a340208d5f9a0be3616747)** (@latticexyz/store-sync)

`blockLogsToStorage(sqliteStorage(...))` converts block logs to SQLite operations. You can use it like:

```ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createPublicClient } from "viem";
import { blockLogsToStorage } from "@latticexyz/store-sync";
import { sqliteStorage } from "@latticexyz/store-sync/sqlite";

const database = drizzle(new Database('store.db')) as any as BaseSQLiteDatabase<"sync", void>;
const publicClient = createPublicClient({ ... });

blockLogs$
  .pipe(
    concatMap(blockLogsToStorage(sqliteStorage({ database, publicClient }))),
    tap(({ blockNumber, operations }) => {
      console.log("stored", operations.length, "operations for block", blockNumber);
    })
  )
  .subscribe();
```

**[feat(common): new utils, truncate table ID parts (#1173)](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)** (@latticexyz/common)

`TableId.toHex()` now truncates name/namespace to 16 bytes each, to properly fit into a `bytes32` hex string.

Also adds a few utils we'll need in the indexer:

- `bigIntMin` is similar to `Math.min` but for `bigint`s
- `bigIntMax` is similar to `Math.max` but for `bigint`s
- `bigIntSort` for sorting an array of `bigint`s
- `chunk` to split an array into chunks
- `wait` returns a `Promise` that resolves after specified number of milliseconds

**[feat(cli): update set-version to match new release structure, add `--tag`, `--commit` (#1157)](https://github.com/latticexyz/mud/commit/c36ffd13c3d859d9a4eadd0e07f6f73ad96b54aa)** (@latticexyz/cli)

- update the `set-version` cli command to work with the new release process by adding two new options:
  - `--tag`: install the latest version of the given tag. For snapshot releases tags correspond to the branch name, commits to `main` result in an automatic snapshot release, so `--tag main` is equivalent to what used to be `-v canary`
  - `--commit`: install a version based on a given commit hash. Since commits from `main` result in an automatic snapshot release it works for all commits on main, and it works for manual snapshot releases from branches other than main
- `set-version` now updates all `package.json` nested below the current working directory (expect `node_modules`), so no need for running it each workspace of a monorepo separately.

Example:

```bash
pnpm mud set-version --tag main && pnpm install
pnpm mud set-version --commit db19ea39 && pnpm install
```

### Patch changes

**[fix(protocol-parser): properly decode empty records (#1177)](https://github.com/latticexyz/mud/commit/4bb7e8cbf0da45c85b70532dc73791e0e2e1d78c)** (@latticexyz/protocol-parser)

`decodeRecord` now properly decodes empty records

**[refactor(store): clean up Memory, make mcopy pure (#1153)](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f)** (@latticexyz/cli, @latticexyz/common, @latticexyz/store, @latticexyz/world)

Clean up Memory.sol, make mcopy pure

**[fix(recs): improve messages for v2 components (#1167)](https://github.com/latticexyz/mud/commit/1e2ad78e277b551dd1b8efb0e4438fb10441644c)** (@latticexyz/recs)

improve RECS error messages for v2 components

**[test: bump forge-std and ds-test (#1168)](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b)** (@latticexyz/cli, @latticexyz/gas-report, @latticexyz/noise, @latticexyz/schema-type, @latticexyz/solecs, @latticexyz/std-contracts, @latticexyz/store, @latticexyz/world, create-mud)

bump forge-std and ds-test dependencies

**[fix(schema-type): fix byte lengths for uint64/int64 (#1175)](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3)** (@latticexyz/schema-type)

Fix byte lengths for `uint64` and `int64`.

**[build: bump TS (#1165)](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b)** (@latticexyz/cli, create-mud, @latticexyz/utils, @latticexyz/world)

bump to latest TS version (5.1.6)

**[build: bump viem, abitype (#1179)](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/network, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/std-client, @latticexyz/store-cache, @latticexyz/store-sync, @latticexyz/store)

- bump to viem 1.3.0 and abitype 0.9.3
- move `@wagmi/chains` imports to `viem/chains`
- refine a few types

**[test(e2e): add more test cases (#1074)](https://github.com/latticexyz/mud/commit/086be4ef4f3c1ecb3eac0e9554d7d4eb64531fc2)** (@latticexyz/services)

fix a bug related to encoding negative bigints in MODE

**[fix: remove devEmit when sending events from SyncWorker (#1109)](https://github.com/latticexyz/mud/commit/e019c77619f0ace6b7ee01f6ce96498446895934)** (@latticexyz/network)

Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.

---
