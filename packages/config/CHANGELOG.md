# Change Log

## 2.0.0-next.13

### Patch Changes

- 3e057061: Removed chalk usage from modules imported in client fix downstream client builds (vite in particular).
- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/schema-type@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- Updated dependencies [16b13ea8]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/schema-type@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/schema-type@2.0.0-next.10

## 2.0.0-next.9

### Major Changes

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

### Patch Changes

- Updated dependencies [[`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)]:
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/schema-type@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.8
  - @latticexyz/schema-type@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.7
  - @latticexyz/schema-type@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/schema-type@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/schema-type@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/schema-type@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- Updated dependencies [[`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- Updated dependencies [[`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Features

- **config:** create config package ([#589](https://github.com/latticexyz/mud/issues/589)) ([d2a23a6](https://github.com/latticexyz/mud/commit/d2a23a6162611353f4930aeadbd8fff2f1c3874c))
- **config:** separate config from cli ([#600](https://github.com/latticexyz/mud/issues/600)) ([cd224a5](https://github.com/latticexyz/mud/commit/cd224a5244ee55316d4b95a21007a8076adefe6e))
