// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { LibAppStorage, AppStorage } from "../libraries/LibAppStorage.sol";

contract UsingAppStorage {
  function getAppStorage() internal pure returns (AppStorage storage) {
    return LibAppStorage.diamondStorage();
  }
}
