// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../../interfaces/IWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { ROOT_NAMESPACE, CORE_MODULE_NAME } from "../../constants.sol";
import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { KeysWithValueHook } from "./KeysWithValueHook.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { MODULE_NAMESPACE } from "./constants.sol";
import { getTargetTableSelector } from "./getTargetTableSelector.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that map to a given value.
 * from value to list of keys with this value. This mapping is stored in a table registered
 * by the module at the `targetTableId` provided in the install methods arguments.
 *
 * Note: for now this module only supports tables with single keys, no composite keys.
 * Support for composite keys can be added by using a parallel array to store the key in the target table.
 *
 * Note: this module currently expects to be `delegatecalled` via World.installRootModule.
 * Support for installing it via `World.installModule` depends on `World.callFrom` being implemented.
 */
contract KeysWithValueModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  // The KeysWithValueHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  KeysWithValueHook immutable hook = new KeysWithValueHook();

  function getName() public pure returns (bytes16) {
    return bytes16("index");
  }

  function install(bytes memory args) public override {
    // Extract source table id from args
    uint256 sourceTableId = abi.decode(args, (uint256));
    bytes32 targetTableSelector = getTargetTableSelector(sourceTableId);

    // Register the target table
    IWorld(_world()).registerTable(
      targetTableSelector.getNamespace(),
      targetTableSelector.getFile(),
      KeysWithValue.getSchema(),
      KeysWithValue.getKeySchema()
    );

    // Grant the hook access to the target table
    IWorld(_world()).grantAccess(targetTableSelector.getNamespace(), targetTableSelector.getFile(), address(hook));

    // Register a hook that is called when a value is set in the source table
    StoreSwitch.registerStoreHook(sourceTableId, hook);
  }
}
