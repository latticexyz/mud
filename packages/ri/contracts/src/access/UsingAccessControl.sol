pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import { AppStorage, LibAppStorage } from "../libraries/LibAppStorage.sol";
import { UsingAppStorage } from "../utils/UsingAppStorage.sol";
import { IAccessController } from "./IAccessController.sol";
import { LibUtils } from "../libraries/LibUtils.sol";

contract UsingAccessControl is UsingAppStorage {
  modifier populateCallerEntityID() {
    bool found = false;
    AppStorage storage appStorage = getAppStorage();
    // iterate through all access controller till one returns an non zero entity id
    for (uint256 i = 0; i < appStorage.accessControllers.length; i++) {
      address accessController = appStorage.accessControllers[i];
      bytes memory returnData = LibUtils.safeDelegateCall(
        accessController,
        abi.encodeWithSelector(IAccessController.getEntityCallerIDFromAddress.selector, msg.sender, msg.sig)
      );
      uint256 callerEntityID = abi.decode(returnData, (uint256));
      if (callerEntityID > 0) {
        appStorage._callerEntityID = callerEntityID;
        found = true;
        break;
      }
    }
    if (!found) {
      appStorage._callerEntityID = 0;
    }
    _;
    if (appStorage.config.resetCallerEntityID) {
      appStorage._callerEntityID = 0;
    }
  }
}
