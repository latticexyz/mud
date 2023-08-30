// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { SystemRegistry } from "./Tables.sol";

library SystemUtils {
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
      bytes32 resourceSelector = SystemRegistry.get(address(this));
      return ResourceSelector.getNamespace(resourceSelector);
    }
  }
}

/**
 * Utility function to revert with raw bytes (eg. coming from a low level call or from a previously encoded error)
 */
function revertWithBytes(bytes memory reason) pure {
  assembly {
    // reason+32 is a pointer to the error message, mload(reason) is the length of the error message
    revert(add(reason, 0x20), mload(reason))
  }
}
