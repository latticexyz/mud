// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreOffchain } from "@latticexyz/store/src/IStore.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { IModule } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

contract OffchainRecordSystem is IStoreOffchain, System {
  using ResourceSelector for bytes32;

  /**
   * Emit StoreSetRecord without modifying storage at the given namespace and name.
   * Requires the caller to have access to the namespace or name (encoded in the resource selector)
   */
  function emitSetRecord(
    bytes32 resourceSelector,
    bytes32[] calldata keyTuple,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    // Require access to the namespace or name
    AccessControl.requireAccess(resourceSelector, msg.sender);

    // Emit set
    StoreCore.emitSetRecord(resourceSelector, keyTuple, data, fieldLayout);
  }

  /**
   * Emit StoreDeleteRecord without modifying storage at the given namespace and name.
   * Requires the caller to have access to the namespace or name (encoded in the resource selector)
   */
  function emitDeleteRecord(bytes32 resourceSelector, bytes32[] calldata keyTuple) public virtual {
    // Require access to the namespace or name
    AccessControl.requireAccess(resourceSelector, msg.sender);

    // Emit delete
    StoreCore.emitDeleteRecord(resourceSelector, keyTuple);
  }
}
