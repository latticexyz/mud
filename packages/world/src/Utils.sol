// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId, WorldResourceIdInstance } from "./WorldResourceId.sol";
import { SystemRegistry } from "./codegen/tables/SystemRegistry.sol";

library Utils {
  using WorldResourceIdInstance for ResourceId;

  /**
   * Get the namespace of this system.
   * Must be used within the context of a system (either directly, or within libraries called by a system).
   *
   * Note unlike systemNamespace, getting systemName is impossible for root systems,
   * because they're delegatecalled and the name isn't passed in calldata
   */
  function systemNamespace() internal view returns (bytes16) {
    if (StoreSwitch.getStoreAddress() == address(this)) {
      return "";
    } else {
      ResourceId systemId = SystemRegistry.get(address(this));
      return systemId.getNamespace();
    }
  }
}
