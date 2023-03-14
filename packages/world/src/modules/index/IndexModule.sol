// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../../interfaces/IWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { ROOT_NAMESPACE, CORE_MODULE_NAME } from "../../constants.sol";
import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { ReverseMappingHook } from "./ReverseMappingHook.sol";
import { ReverseMapping } from "./tables/ReverseMapping.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of a "reverse mapping"
 * from value to list of keys with this value. This mapping is stored in a table registered
 * by the module at the `targetTableId` provided in the install methods arguments.
 *
 * Note: for now this module only supports tables with single keys, no composite keys.
 * Support for composite keys can be added by using a parallel array to store the key in the target table.
 *
 * Note: this module currently expects to be `delegatecalled` via World.installRootModule.
 * Support for installing it via `World.installModule` depends on `World.callFrom` being implemented.
 */
contract IndexModule is IModule, WorldContext {
  error CouldNotGrantAccess(string resource);
  using ResourceSelector for bytes32;

  function getName() public pure returns (bytes16) {
    return bytes16("index");
  }

  function install(bytes memory args) public override {
    // Extract source and target table ids from args
    (uint256 sourceTableId, uint256 targetTableId) = abi.decode(args, (uint256, uint256));

    // Register the target table
    StoreSwitch.registerSchema(targetTableId, ReverseMapping.getSchema(), ReverseMapping.getKeySchema());

    // Deploy a new hook contract that is called when a value is set in the source table
    ReverseMappingHook hook = new ReverseMappingHook(sourceTableId, targetTableId);

    // Grant the hook access to the target table
    bytes32 targetTableSelector = ResourceSelector.from(targetTableId);
    (bool success, ) = _world().delegatecall(
      abi.encodeWithSignature(
        "grantAccess(bytes16,bytes16,address)",
        targetTableSelector.getNamespace(),
        targetTableSelector.getFile(),
        address(hook)
      )
    );
    if (!success) revert CouldNotGrantAccess(ResourceSelector.from(sourceTableId).toString());

    // Register a hook that is called when a value is set in the source table
    StoreSwitch.registerStoreHook(sourceTableId, hook);
  }
}
