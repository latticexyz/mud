// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";

import { UniqueEntity } from "./tables/UniqueEntity.sol";

/**
 * This module creates a table that stores a nonce, and `getUniqueEntity`
 * returns an incremented nonce each time.
 *
 * Note: this module currently expects to be `delegatecalled` via World.installRootModule.
 * Support for installing it via `World.installModule` depends on `World.callFrom` being implemented.
 */
contract UniqueEntityModule is IModule, WorldContext {
  function getName() public pure returns (bytes16) {
    return bytes16("uniqueEntity");
  }

  // The namespace argument is not used because the module is always installed in the root namespace
  function install(bytes memory) public {
    UniqueEntity.registerSchema();
    UniqueEntity.setMetadata();
  }
}
