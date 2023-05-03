// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { Call } from "../../../Call.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../../tables/InstalledModules.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";

contract EphemeralRecordSystem is System {
  using ResourceSelector for bytes32;

  /**
   * Emit the ephemeral event without modifying storage at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function setEphemeralRecord(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    bytes calldata data
  ) public virtual {
    // Require access to the namespace or name
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, name, msg.sender);

    // Set the record
    StoreCore.setEphemeralRecord(resourceSelector, key, data);
  }
}
