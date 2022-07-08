pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
// import { LibAppStorage, AppStorage } from "./LibAppStorage.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

// TODO: Refactor to new systems pattern
library LibECS {
  // function getAppStorage() internal pure returns (AppStorage storage) {
  //   return LibAppStorage.diamondStorage();
  // }
  // function resolveOwnedByChain(uint256 entityID) internal view returns (uint256) {
  //   AppStorage storage s = getAppStorage();
  //   OwnedByComponent ownedByComponent = OwnedByComponent(s.world.getComponent(OwnedByComponentID));
  //   uint256 currentEntityID = entityID;
  //   while (true) {
  //     if (ownedByComponent.has(currentEntityID)) {
  //       currentEntityID = ownedByComponent.getValue(currentEntityID);
  //     } else {
  //       return currentEntityID;
  //     }
  //   }
  //   return currentEntityID;
  // }
  // function doesCallerEntityIDOwnEntity(uint256 entityID) internal view returns (bool) {
  //   AppStorage storage s = getAppStorage();
  //   OwnedByComponent ownedByComponent = OwnedByComponent(s.world.getComponent(OwnedByComponentID));
  //   uint256 currentEntityID = entityID;
  //   while (true) {
  //     if (currentEntityID == s._callerEntityID) {
  //       return true;
  //     }
  //     if (ownedByComponent.has(currentEntityID)) {
  //       currentEntityID = ownedByComponent.getValue(currentEntityID);
  //     } else {
  //       return false;
  //     }
  //   }
  //   return false;
  // }
}
