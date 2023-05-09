// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { ResourceType } from "../core/tables/ResourceType.sol";
import { Resource } from "../../Types.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValueHook } from "./KeysWithValueHook.sol";
import { KeysWithValue, KeysWithValueTableId } from "./tables/KeysWithValue.sol";
import { WithValueIndex, WithValueIndexTableId } from "./tables/WithValueIndex.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that map to a given value.
 * from value to list of keys with this value. This mapping is stored in a table registered
 * by the module at the `targetTableId` provided in the install methods arguments.
 *
 * Note: if a table with composite keys is used, only the first key is indexed
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
    return bytes16("keysWithValue");
  }

  function install(bytes memory args) public override {
    // Extract source table id from args
    bytes32 sourceTableId = abi.decode(args, (bytes32));

    IBaseWorld world = IBaseWorld(_world());

    if (ResourceType.get(KeysWithValueTableId) == Resource.NONE) {
      // Register the tables
      world.registerTable(
        KeysWithValueTableId.getNamespace(),
        KeysWithValueTableId.getName(),
        KeysWithValue.getSchema(),
        KeysWithValue.getKeySchema()
      );
      world.registerTable(
        WithValueIndexTableId.getNamespace(),
        WithValueIndexTableId.getName(),
        WithValueIndex.getSchema(),
        WithValueIndex.getKeySchema()
      );

      // Register metadata for the tables
      (string memory tableName1, string[] memory fieldNames1) = KeysWithValue.getMetadata();
      world.setMetadata(KeysWithValueTableId.getNamespace(), KeysWithValueTableId.getName(), tableName1, fieldNames1);
      (string memory tableName2, string[] memory fieldNames2) = WithValueIndex.getMetadata();
      world.setMetadata(WithValueIndexTableId.getNamespace(), WithValueIndexTableId.getName(), tableName2, fieldNames2);

      // Grant the hook access to the tables
      world.grantAccess(KeysWithValueTableId.getNamespace(), KeysWithValueTableId.getName(), address(hook));
      world.grantAccess(WithValueIndexTableId.getNamespace(), WithValueIndexTableId.getName(), address(hook));
    }

    // Register a hook that is called when a value is set in the source table
    world.registerStoreHook(sourceTableId, hook);
  }
}
