// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId, WorldResourceIdInstance } from "./WorldResourceId.sol";
import { SystemRegistry } from "./codegen/tables/SystemRegistry.sol";

/**
 * @notice Various utilities
 * @dev These utilities are not used by MUD itself, they are for developers using MUD.
 */
library Utils {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @notice Fetches the namespace of the current system.
   * @dev This function determines the system's namespace based on its interaction with the store. If the system is a root system, it returns the root namespace (an empty string). Otherwise, it retrieves the namespace using the system's registry.
   * This function must be used within the context of a system (either directly or within libraries called by a system).
   * @return Returns a bytes14 representation of the system's namespace.
   */
  function systemNamespace() internal view returns (bytes14) {
    /**
     * Unlike systemNamespace, getting systemName is impossible for root systems,
     * because they're delegatecalled and the name isn't passed in calldata
     */
    if (StoreSwitch.getStoreAddress() == address(this)) {
      return "";
    } else {
      ResourceId systemId = SystemRegistry.get(address(this));
      return systemId.getNamespace();
    }
  }
}
