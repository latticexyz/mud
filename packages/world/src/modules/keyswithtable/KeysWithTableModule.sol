// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithTableHook } from "./KeysWithTableHook.sol";
import { KeysWithTable } from "./tables/KeysWithTable.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that are in a given table.
 * from value to list of keys in this table. This mapping is stored in a table registered
 * by the module at the `targetTableId` provided in the install methods arguments.
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 *
 * Note: this module currently expects to be `delegatecalled` via World.installRootModule.
 * Support for installing it via `World.installModule` depends on `World.callFrom` being implemented.
 */
contract KeysWithTableModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  // The KeysWithTableHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  KeysWithTableHook immutable hook = new KeysWithTableHook();

  function getName() public pure returns (bytes16) {
    return bytes16("index");
  }

  function install(bytes memory args) public override {
    // Extract source table id from args
    uint256 sourceTableId = abi.decode(args, (uint256));
    bytes32 targetTableSelector = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);

    // Register the target table
    IBaseWorld(_world()).registerTable(
      targetTableSelector.getNamespace(),
      targetTableSelector.getFile(),
      KeysWithTable.getSchema(),
      KeysWithTable.getKeySchema()
    );

    // Register metadata for the target table
    (string memory tableName, string[] memory fieldNames) = KeysWithTable.getMetadata();
    IBaseWorld(_world()).setMetadata(
      targetTableSelector.getNamespace(),
      targetTableSelector.getFile(),
      tableName,
      fieldNames
    );

    // Grant the hook access to the target table
    IBaseWorld(_world()).grantAccess(targetTableSelector.getNamespace(), targetTableSelector.getFile(), address(hook));

    // Register a hook that is called when a value is set in the source table
    StoreSwitch.registerStoreHook(sourceTableId, hook);
  }
}
