// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";

import { UsingAppStorage } from "../utils/UsingAppStorage.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { LibUtils } from "../libraries/LibUtils.sol";

contract CreateEntityFromPrototypeEmbodiedSystem is UsingAppStorage {
  function createEntityFromPrototype(bytes memory argument) external {
    revert("Unimplemented");
  }
}
