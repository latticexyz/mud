pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import { LibAppStorage, AppStorage } from "./LibAppStorage.sol";
import { LibDiamond, DiamondStorage } from "../diamond/libraries/LibDiamond.sol";
import { LibUtils } from "./LibUtils.sol";

library LibEmbodiedSystem {
  function getAppStorage() internal pure returns (AppStorage storage) {
    return LibAppStorage.diamondStorage();
  }

  function registerEmbodiedSystemAndSelector(address addr, bytes4 selector) internal {
    AppStorage storage appStorage = getAppStorage();
    require(appStorage.embodiedSystemSelectorToImplementation[selector] == address(0), "Selector already registered");
    appStorage.embodiedSystemSelectorToImplementation[selector] = addr;
  }

  function callEmbodiedSystem(bytes4 selector, bytes memory argument) internal {
    AppStorage storage appStorage = getAppStorage();
    address embodiedSystemImplementation = appStorage.embodiedSystemSelectorToImplementation[selector];
    require(embodiedSystemImplementation != address(0), "Selector has not been registered");
    LibUtils.safeDelegateCall(embodiedSystemImplementation, abi.encodeWithSelector(selector, argument));
  }
}
