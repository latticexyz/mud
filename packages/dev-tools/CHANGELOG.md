# @latticexyz/dev-tools

## 2.0.0-next.13

### Patch Changes

- Updated dependencies [52182f70]
- Updated dependencies [de47d698]
- Updated dependencies [f6d214e3]
- Updated dependencies [fa776358]
- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/utils@2.0.0-next.13
  - @latticexyz/store-sync@2.0.0-next.13
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/recs@2.0.0-next.13
  - @latticexyz/store@2.0.0-next.13
  - @latticexyz/world@2.0.0-next.13
  - @latticexyz/react@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- d2f8e940: Moved to new resource ID utils.
- Updated dependencies [7ce82b6f]
- Updated dependencies [7fa2ca18]
- Updated dependencies [6ca1874e]
- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
- Updated dependencies [29c3f508]
- Updated dependencies [d2f8e940]
  - @latticexyz/store@2.0.0-next.12
  - @latticexyz/world@2.0.0-next.12
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/store-sync@2.0.0-next.12
  - @latticexyz/react@2.0.0-next.12
  - @latticexyz/recs@2.0.0-next.12
  - @latticexyz/utils@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8
- Updated dependencies [08d7c471]
- Updated dependencies [16b13ea8]
- Updated dependencies [430e6b29]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/store-sync@2.0.0-next.11
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/world@2.0.0-next.11
  - @latticexyz/store@2.0.0-next.11
  - @latticexyz/recs@2.0.0-next.11
  - @latticexyz/react@2.0.0-next.11
  - @latticexyz/utils@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies [[`4081493b`](https://github.com/latticexyz/mud/commit/4081493b84ab5c78a5147d4af8d41fc2d9e027a5), [`88b1a5a1`](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29), [`7987c94d`](https://github.com/latticexyz/mud/commit/7987c94d61a2c759916a708774db9f3cf08edca8)]:
  - @latticexyz/store-sync@2.0.0-next.10
  - @latticexyz/world@2.0.0-next.10
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/react@2.0.0-next.10
  - @latticexyz/recs@2.0.0-next.10
  - @latticexyz/store@2.0.0-next.10
  - @latticexyz/utils@2.0.0-next.10

## 2.0.0-next.9

### Major Changes

- [#1354](https://github.com/latticexyz/mud/pull/1354) [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853) Thanks [@dk1a](https://github.com/dk1a)! - We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

  As such, we've replaced `blockStorageOperations# @latticexyz/dev-tools with `storedBlockLogs# @latticexyz/dev-tools, a stream of simplified Store event logs after they've been synced to the configured storage adapter. These logs may not reflect exactly the events that are on chain when e.g. hydrating from an indexer, but they will still allow the client to "catch up" to the on-chain state of your tables.

### Minor Changes

- [#1497](https://github.com/latticexyz/mud/pull/1497) [`24a0dd44`](https://github.com/latticexyz/mud/commit/24a0dd4440d6fe661640c581ff5348d62eae9302) Thanks [@y77cao](https://github.com/y77cao)! - Improved rendering of transactions that make calls via World's `call` and `callFrom` methods

### Patch Changes

- [#1505](https://github.com/latticexyz/mud/pull/1505) [`e0193e57`](https://github.com/latticexyz/mud/commit/e0193e5737fa2148d5d2b888d71df01d1e46b6d5) Thanks [@holic](https://github.com/holic)! - Updates store event `key` reference to `keyTuple`

- [#1502](https://github.com/latticexyz/mud/pull/1502) [`e0377761`](https://github.com/latticexyz/mud/commit/e0377761c3a3f83a23de78f6bcb0733c500a0825) Thanks [@holic](https://github.com/holic)! - Updates `table` reference to `tableId`

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

- Updated dependencies [[`77dce993`](https://github.com/latticexyz/mud/commit/77dce993a12989dc58534ccf1a8928b156be494a), [`748f4588`](https://github.com/latticexyz/mud/commit/748f4588a218928bca041760448c26991c0d8033), [`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84), [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9), [`c07fa021`](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07), [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8), [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e), [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623), [`e5d208e4`](https://github.com/latticexyz/mud/commit/e5d208e40b2b2fae223b48716ce3f62c530ea1ca), [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9), [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c), [`1f80a0b5`](https://github.com/latticexyz/mud/commit/1f80a0b52a5c2d051e3697d6e60aad7364b0a925), [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c), [`4c7fd3eb`](https://github.com/latticexyz/mud/commit/4c7fd3eb29e3d3954f2f1f36ace474a436082651), [`a0341daf`](https://github.com/latticexyz/mud/commit/a0341daf9fd87e8072ffa292a33f508dd37b8ca6), [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840), [`f1cd43bf`](https://github.com/latticexyz/mud/commit/f1cd43bf9264d5a23a3edf2a1ea4212361a72203), [`7e6e5157`](https://github.com/latticexyz/mud/commit/7e6e5157bb124f19bd8ed9f02b93afadc97cdf50), [`31ffc9d5`](https://github.com/latticexyz/mud/commit/31ffc9d5d0a6d030cc61349f0f8fbcf6748ebc48), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`5741d53d`](https://github.com/latticexyz/mud/commit/5741d53d0a39990a0d7b2842f1f012973655e060), [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612), [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87), [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70), [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7), [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314), [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`251170e1`](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b), [`95c59b20`](https://github.com/latticexyz/mud/commit/95c59b203259c20a6f944c5f9af008b44e2902b6)]:
  - @latticexyz/world@2.0.0-next.9
  - @latticexyz/store@2.0.0-next.9
  - @latticexyz/store-sync@2.0.0-next.9
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/react@2.0.0-next.9
  - @latticexyz/recs@2.0.0-next.9
  - @latticexyz/utils@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies [[`1d60930d`](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7), [`b9e562d8`](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac), [`51914d65`](https://github.com/latticexyz/mud/commit/51914d656d8cd8d851ccc8296d249cf09f53e670), [`2ca75f9b`](https://github.com/latticexyz/mud/commit/2ca75f9b9063ea33524e6c609b87f5494f678fa0), [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)]:
  - @latticexyz/store@2.0.0-next.8
  - @latticexyz/world@2.0.0-next.8
  - @latticexyz/react@2.0.0-next.8
  - @latticexyz/store-sync@2.0.0-next.8
  - @latticexyz/common@2.0.0-next.8
  - @latticexyz/recs@2.0.0-next.8
  - @latticexyz/utils@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies [[`c4d5eb4e`](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15), [`18d3aea5`](https://github.com/latticexyz/mud/commit/18d3aea55b1d7f4b442c21343795c299a56fc481)]:
  - @latticexyz/store@2.0.0-next.7
  - @latticexyz/world@2.0.0-next.7
  - @latticexyz/react@2.0.0-next.7
  - @latticexyz/store-sync@2.0.0-next.7
  - @latticexyz/common@2.0.0-next.7
  - @latticexyz/recs@2.0.0-next.7
  - @latticexyz/utils@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies [[`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)]:
  - @latticexyz/store@2.0.0-next.6
  - @latticexyz/world@2.0.0-next.6
  - @latticexyz/react@2.0.0-next.6
  - @latticexyz/store-sync@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6
  - @latticexyz/recs@2.0.0-next.6
  - @latticexyz/utils@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies [[`ce97426c`](https://github.com/latticexyz/mud/commit/ce97426c0d70832e5efdb8bad83207a9d840302b), [`1ca35e9a`](https://github.com/latticexyz/mud/commit/1ca35e9a1630a51dfd1e082c26399f76f2cd06ed), [`9d0f492a`](https://github.com/latticexyz/mud/commit/9d0f492a90e5d94c6b38ad732e78fd4b13b2adbe), [`c583f3cd`](https://github.com/latticexyz/mud/commit/c583f3cd08767575ce9df39725ec51195b5feb5b)]:
  - @latticexyz/world@2.0.0-next.5
  - @latticexyz/store-sync@2.0.0-next.5
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/react@2.0.0-next.5
  - @latticexyz/recs@2.0.0-next.5
  - @latticexyz/store@2.0.0-next.5
  - @latticexyz/utils@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies [[`ce7125a1`](https://github.com/latticexyz/mud/commit/ce7125a1b97efd3db47c5ea1593d5a37ba143f64), [`c14f8bf1`](https://github.com/latticexyz/mud/commit/c14f8bf1ec8c199902c12899853ac144aa69bb9c), [`e3de1a33`](https://github.com/latticexyz/mud/commit/e3de1a338fe110ac33ba9fb833366541e4cf4cf1)]:
  - @latticexyz/recs@2.0.0-next.4
  - @latticexyz/react@2.0.0-next.4
  - @latticexyz/store-sync@2.0.0-next.4
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/store@2.0.0-next.4
  - @latticexyz/utils@2.0.0-next.4
  - @latticexyz/world@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57), [`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`c32a9269`](https://github.com/latticexyz/mud/commit/c32a9269a30c1898932ebbf7e3b60e25d1bd884c), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1), [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd), [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db), [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab), [`3e024fcf`](https://github.com/latticexyz/mud/commit/3e024fcf395a1c1b38d12362fc98472290eb7cf1), [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/store@2.0.0-next.3
  - @latticexyz/world@2.0.0-next.3
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/store-sync@2.0.0-next.3
  - @latticexyz/react@2.0.0-next.3
  - @latticexyz/recs@2.0.0-next.3
  - @latticexyz/utils@2.0.0-next.3

## 2.0.0-next.2

### Major Changes

- [#1284](https://github.com/latticexyz/mud/pull/1284) [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad) Thanks [@holic](https://github.com/holic)! - MUD dev tools is updated to latest sync stack. You must now pass in all of its data requirements rather than relying on magic globals.

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

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- [#1240](https://github.com/latticexyz/mud/pull/1240) [`753bdce4`](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e) Thanks [@holic](https://github.com/holic)! - Store sync logic is now consolidated into a `createStoreSync` function exported from `@latticexyz/store-sync`. This simplifies each storage sync strategy to just a simple wrapper around the storage adapter. You can now sync to RECS with `syncToRecs` or SQLite with `syncToSqlite` and PostgreSQL support coming soon.

  There are no breaking changes if you were just using `syncToRecs` from `@latticexyz/store-sync` or running the `sqlite-indexer` binary from `@latticexyz/store-indexer`.

- [#1302](https://github.com/latticexyz/mud/pull/1302) [`5294a7d5`](https://github.com/latticexyz/mud/commit/5294a7d5983c52cb336373566afd6a8ec7fc4bfb) Thanks [@holic](https://github.com/holic)! - Improves support for internal/client-only RECS components

- Updated dependencies [[`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`753bdce4`](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e), [`5294a7d5`](https://github.com/latticexyz/mud/commit/5294a7d5983c52cb336373566afd6a8ec7fc4bfb), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad)]:
  - @latticexyz/store@2.0.0-next.2
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/store-sync@2.0.0-next.2
  - @latticexyz/world@2.0.0-next.2
  - @latticexyz/react@2.0.0-next.2
  - @latticexyz/recs@2.0.0-next.2
  - @latticexyz/utils@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- [#1258](https://github.com/latticexyz/mud/pull/1258) [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7) Thanks [@holic](https://github.com/holic)! - Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

- Updated dependencies [[`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`e259ef79`](https://github.com/latticexyz/mud/commit/e259ef79f4d9026353176d0f74628cae50c2f69b), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/std-client@2.0.0-next.1
  - @latticexyz/network@2.0.0-next.1
  - @latticexyz/world@2.0.0-next.1
  - @latticexyz/react@2.0.0-next.1
  - @latticexyz/utils@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda), [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee), [`e019c776`](https://github.com/latticexyz/mud/commit/e019c77619f0ace6b7ee01f6ce96498446895934)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/world@2.0.0-next.0
  - @latticexyz/utils@2.0.0-next.0
  - @latticexyz/network@2.0.0-next.0
  - @latticexyz/std-client@2.0.0-next.0
  - @latticexyz/react@2.0.0-next.0
