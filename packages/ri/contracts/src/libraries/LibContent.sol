pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import { PersonaMirror } from "persona/L2/PersonaMirror.sol";
import { LibAppStorage, AppStorage } from "./LibAppStorage.sol";
import { LibDiamond, DiamondStorage } from "../diamond/libraries/LibDiamond.sol";
import { LibUtils } from "./LibUtils.sol";
import { IContentCreator } from "../entities/IContentCreator.sol";

library LibContent {
  function registerContentCreator(address contentCreatorAddr) internal {
    LibUtils.safeDelegateCall(contentCreatorAddr, abi.encodeWithSelector(IContentCreator.createContent.selector));
  }
}
