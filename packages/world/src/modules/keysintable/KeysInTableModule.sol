// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";

import { ResourceType } from "../core/tables/ResourceType.sol";
import { Resource } from "../../Types.sol";
import { Module } from "../../Module.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";
import { revertWithBytes } from "../../revertWithBytes.sol";

import { KeysInTableHook } from "./KeysInTableHook.sol";
import { KeysInTable, KeysInTableTableId } from "./tables/KeysInTable.sol";
import { UsedKeysIndex, UsedKeysIndexTableId } from "./tables/UsedKeysIndex.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that are in a given table.
 * This mapping is stored in a global table that is registered when the module is first installed.
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 *
 * Note: this module currently only supports `installRoot` (via `World.installRootModule`).
 * TODO: add support for `install` (via `World.installModule`) by using `callFrom` with the `msgSender()`
 */
contract KeysInTableModule is Module {
  using ResourceSelector for bytes32;

  // The KeysInTableHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  KeysInTableHook private immutable hook = new KeysInTableHook();

  function getName() public pure returns (bytes16) {
    return bytes16("keysInTable");
  }

  function installRoot(bytes memory args) public override {
    // Extract source table id from args
    bytes32 sourceTableId = abi.decode(args, (bytes32));

    IBaseWorld world = IBaseWorld(_world());

    // Initialize variable to reuse in low level calls
    bool success;
    bytes memory returnData;

    if (ResourceType.get(KeysInTableTableId) == Resource.NONE) {
      // Register the tables
      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(
          world.registerTable,
          (
            KeysInTableTableId,
            KeysInTable.getFieldLayout(),
            KeysInTable.getKeySchema(),
            KeysInTable.getValueSchema(),
            KeysInTable.getOffchainOnly(),
            KeysInTable.getKeyNames(),
            KeysInTable.getFieldNames()
          )
        )
      );
      if (!success) revertWithBytes(returnData);

      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(
          world.registerTable,
          (
            UsedKeysIndexTableId,
            UsedKeysIndex.getFieldLayout(),
            UsedKeysIndex.getKeySchema(),
            UsedKeysIndex.getValueSchema(),
            UsedKeysIndex.getOffchainOnly(),
            UsedKeysIndex.getKeyNames(),
            UsedKeysIndex.getFieldNames()
          )
        )
      );
      if (!success) revertWithBytes(returnData);

      // Grant the hook access to the tables
      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(world.grantAccess, (KeysInTableTableId, address(hook)))
      );
      if (!success) revertWithBytes(returnData);

      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(world.grantAccess, (UsedKeysIndexTableId, address(hook)))
      );
      if (!success) revertWithBytes(returnData);
    }

    // Register a hook that is called when a value is set in the source table
    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerStoreHook,
        (
          sourceTableId,
          hook,
          StoreHookLib.encodeBitmap({
            onBeforeSetRecord: true,
            onAfterSetRecord: false,
            onBeforeSetField: false,
            onAfterSetField: true,
            onBeforeDeleteRecord: true,
            onAfterDeleteRecord: false
          })
        )
      )
    );
  }

  function install(bytes memory) public pure {
    revert NonRootInstallNotSupported();
  }
}
