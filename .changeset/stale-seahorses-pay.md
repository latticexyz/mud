---
"@latticexyz/cli": major
"@latticexyz/common": major
"@latticexyz/config": major
"@latticexyz/store": major
---


- `ResourceSelector` is replaced with `ResourceId`, `ResourceIdLib`, `ResourceIdInstance`, `WorldResourceIdLib` and `WorldResourceIdInstance`.

  Previously a "resource selector" was a `bytes32` value with the first 16 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.
  Now a "resource ID" is a `bytes32` value with the first 14 bytes reserved for the resource's namespace, the next 16 bytes reserved for the resource's name, and the last 2 bytes reserved for the resource type.

  Previously `ResouceSelector` was a library and the resource selector type was a plain `bytes32`.
  Now `ResourceId` is a user type, and the functionality is implemented in the `ResourceIdInstance` (for type) and `WorldResourceIdInstance` (for namespace and name) libraries.
  We split the logic into two libraries, because `Store` now also uses `ResourceId` and needs to be aware of resource types, but not of namespaces/names.

  ```diff
  - import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";
  + import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
  + import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
  + import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

  - bytes32 systemId = ResourceSelector.from("namespace", "name");
  + ResourceId systemId = WorldResourceIdLib.encode("namespace", "name", RESOURCE_SYSTEM);

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
