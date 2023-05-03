// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE, KEYS_LENGTH_NAMESPACE, USED_KEYS_NAMESPACE } from "./constants.sol";
import { KeysInTableHook } from "./KeysInTableHook.sol";
import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that are in a given table.
 * This mapping is stored in a table registered by the module at the `targetTableId` provided in the
 * install methods arguments.
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 *
 * Note: this module currently expects to be `delegatecalled` via World.installRootModule.
 * Support for installing it via `World.installModule` depends on `World.callFrom` being implemented.
 */
contract KeysInTableModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  // The KeysInTableHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  KeysInTableHook immutable hook = new KeysInTableHook();

  function getName() public pure returns (bytes16) {
    return bytes16("index");
  }

  function grantAccess(IBaseWorld world, bytes32 targetTableSelector) internal {
    // Grant the hook access to the target table
    world.grantAccess(targetTableSelector.getNamespace(), targetTableSelector.getName(), address(hook));
  }

  function install(bytes memory args) public override {
    // Extract source table id from args
    bytes32 sourceTableId = abi.decode(args, (bytes32));

    bytes32 targetTableSelector1 = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);
    bytes32 targetTableSelector2 = getTargetTableSelector(USED_KEYS_NAMESPACE, sourceTableId);

    IBaseWorld world = IBaseWorld(_world());

    // Register the target table
    world.registerTable(
      targetTableSelector1.getNamespace(),
      targetTableSelector1.getName(),
      KeysInTable.getSchema(),
      KeysInTable.getKeySchema()
    );
    world.registerTable(
      targetTableSelector2.getNamespace(),
      targetTableSelector2.getName(),
      UsedKeysIndex.getSchema(),
      UsedKeysIndex.getKeySchema()
    );

    // Register metadata for the target table
    (string memory tableName1, string[] memory fieldNames1) = KeysInTable.getMetadata();
    world.setMetadata(targetTableSelector1.getNamespace(), targetTableSelector1.getName(), tableName1, fieldNames1);
    (string memory tableName2, string[] memory fieldNames2) = UsedKeysIndex.getMetadata();
    world.setMetadata(targetTableSelector2.getNamespace(), targetTableSelector2.getName(), tableName2, fieldNames2);

    grantAccess(world, targetTableSelector1);
    grantAccess(world, targetTableSelector2);

    // Register a hook that is called when a value is set in the source table
    StoreSwitch.registerStoreHook(sourceTableId, hook);
  }
}
