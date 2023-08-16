// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreEphemeral } from "@latticexyz/store/src/IStore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { IModule } from "../../../interfaces/IModule.sol";
import { IWorldEphemeral } from "../../../interfaces/IWorldEphemeral.sol";
import { System } from "../../../System.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { Call } from "../../../Call.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../../tables/InstalledModules.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

contract EphemeralRecordSystem is IStoreEphemeral, IWorldEphemeral, System {
  using ResourceSelector for bytes32;

  /**
   * Emit the ephemeral event without modifying storage at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function emitEphemeralRecord(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    bytes calldata data,
    Schema valueSchema
  ) public virtual {
    // Require access to the namespace or name
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, name, msg.sender);

    // Set the record
    StoreCore.emitEphemeralRecord(resourceSelector, key, data, valueSchema);
  }

  /**
   * Emit the ephemeral event without modifying storage at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function emitEphemeralRecord(
    bytes32 tableId,
    bytes32[] calldata key,
    bytes calldata data,
    Schema valueSchema
  ) public virtual {
    emitEphemeralRecord(tableId.getNamespace(), tableId.getName(), key, data, valueSchema);
  }
}
