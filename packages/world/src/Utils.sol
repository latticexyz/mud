// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { SystemRegistry } from "./Tables.sol";

library Utils {
  /**
   * Get the namespace of this system.
   * Must be used within the context of a system (either directly, or within libraries called by a system).
   *
   * Note unlike systemNamespace, getting systemName is impossible for root systems,
   * because they're delegatecalled and the name isn't passed in calldata
   */
  function systemNamespace() internal view returns (bytes16) {
    if (StoreSwitch.isDelegateCall()) {
      return "";
    } else {
      bytes32 resourceSelector = SystemRegistry.get(address(this));
      return ResourceSelector.getNamespace(resourceSelector);
    }
  }
}
