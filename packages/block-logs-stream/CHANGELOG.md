# @latticexyz/block-logs-stream

## 2.0.0-next.13

### Patch Changes

- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/common@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
  - @latticexyz/common@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8
- Updated dependencies [16b13ea8]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/common@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.10

## 2.0.0-next.9

### Patch Changes

- [#1484](https://github.com/latticexyz/mud/pull/1484) [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847) Thanks [@alvrs](https://github.com/alvrs)! - Renamed all occurrences of `table` where it is used as "table ID" to `tableId`.
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

- [#1492](https://github.com/latticexyz/mud/pull/1492) [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96) Thanks [@alvrs](https://github.com/alvrs)! - Renamed all occurrences of `key` where it is used as "key tuple" to `keyTuple`.
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

- [#1558](https://github.com/latticexyz/mud/pull/1558) [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f) Thanks [@alvrs](https://github.com/alvrs)! - What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- [#1577](https://github.com/latticexyz/mud/pull/1577) [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c) Thanks [@alvrs](https://github.com/alvrs)! - `Store` events have been renamed for consistency and readability.
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

- Updated dependencies [[`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)]:
  - @latticexyz/common@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.8
  - @latticexyz/config@2.0.0-next.8
  - @latticexyz/schema-type@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.7
  - @latticexyz/config@2.0.0-next.7
  - @latticexyz/schema-type@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6
  - @latticexyz/config@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/config@2.0.0-next.5
  - @latticexyz/schema-type@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/config@2.0.0-next.4
  - @latticexyz/schema-type@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/config@2.0.0-next.3
  - @latticexyz/schema-type@2.0.0-next.3

## 2.0.0-next.2

### Major Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - - removes our own `getLogs` function now that viem's `getLogs` supports using multiple `events` per RPC call.
  - removes `isNonPendingBlock` and `isNonPendingLog` helpers now that viem narrows `Block` and `Log` types based on inputs
  - simplifies `groupLogsByBlockNumber` types and tests

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- Updated dependencies [[`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2
  - @latticexyz/config@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- Updated dependencies [[`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1
  - @latticexyz/config@2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#1176](https://github.com/latticexyz/mud/pull/1176) [`eeb15cc0`](https://github.com/latticexyz/mud/commit/eeb15cc06fcbe80c37ba3926d9387f6bd5947234) Thanks [@holic](https://github.com/holic)! - - Replace `blockEventsToStorage` with `blockLogsToStorage` that exposes a `storeOperations` callback to perform database writes from store operations. This helps encapsulates database adapters into a single wrapper/instance of `blockLogsToStorage` and allows for wrapping a block of store operations in a database transaction.

  - Add `toBlock` option to `groupLogsByBlockNumber` and remove `blockHash` from results. This helps track the last block number for a given set of logs when used in the context of RxJS streams.

- [#1070](https://github.com/latticexyz/mud/pull/1070) [`72b80697`](https://github.com/latticexyz/mud/commit/72b806979db6eb2880772193898351d657b94f75) Thanks [@holic](https://github.com/holic)! - Add block logs stream package

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

### Patch Changes

- [#1075](https://github.com/latticexyz/mud/pull/1075) [`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9) Thanks [@holic](https://github.com/holic)! - Add store sync package

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0
  - @latticexyz/config@2.0.0-next.0
