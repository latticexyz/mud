pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import { PersonaMirror } from "persona/L2/PersonaMirror.sol";
import { LibAppStorage, AppStorage } from "./LibAppStorage.sol";
import { LibDiamond, DiamondStorage } from "../diamond/libraries/LibDiamond.sol";
import { LibUtils } from "./LibUtils.sol";

library LibAccessControl {
  function getAppStorage() internal pure returns (AppStorage storage) {
    return LibAppStorage.diamondStorage();
  }

  function registerAccessController(address addr) internal {
    AppStorage storage appStorage = getAppStorage();
    for (uint256 i; i < appStorage.accessControllers.length; i++) {
      if (appStorage.accessControllers[i] == addr) {
        return;
      }
    }
    appStorage.accessControllers.push(addr);
  }
}
