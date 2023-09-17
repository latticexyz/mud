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
