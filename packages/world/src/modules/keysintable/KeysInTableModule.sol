// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceType } from "../core/tables/ResourceType.sol";
import { Resource } from "../../Types.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { KeysInTableHook } from "./KeysInTableHook.sol";
import { KeysInTable, KeysInTableTableId } from "./tables/KeysInTable.sol";
import { InTableIndex, InTableIndexTableId } from "./tables/InTableIndex.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that are in a given table.
 * This mapping is stored in a global table that is registered when the module is first installed.
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
    return bytes16("keysInTable");
  }

  function install(bytes memory args) public override {
    // Extract source table id from args
    bytes32 sourceTableId = abi.decode(args, (bytes32));

    IBaseWorld world = IBaseWorld(_world());

    if (ResourceType.get(KeysInTableTableId) == Resource.NONE) {
      // Register the tables
      world.registerTable(
        KeysInTableTableId.getNamespace(),
        KeysInTableTableId.getName(),
        KeysInTable.getSchema(),
        KeysInTable.getKeySchema()
      );
      world.registerTable(
        InTableIndexTableId.getNamespace(),
        InTableIndexTableId.getName(),
        InTableIndex.getSchema(),
        InTableIndex.getKeySchema()
      );

      // Register metadata for the tables
      (string memory tableName1, string[] memory fieldNames1) = KeysInTable.getMetadata();
      world.setMetadata(KeysInTableTableId.getNamespace(), KeysInTableTableId.getName(), tableName1, fieldNames1);
      (string memory tableName2, string[] memory fieldNames2) = InTableIndex.getMetadata();
      world.setMetadata(InTableIndexTableId.getNamespace(), InTableIndexTableId.getName(), tableName2, fieldNames2);

      // Grant the hook access to the tables
      world.grantAccess(KeysInTableTableId.getNamespace(), KeysInTableTableId.getName(), address(hook));
      world.grantAccess(InTableIndexTableId.getNamespace(), InTableIndexTableId.getName(), address(hook));
    }

    // Register a hook that is called when a value is set in the source table
    world.registerStoreHook(sourceTableId, hook);
  }
}
