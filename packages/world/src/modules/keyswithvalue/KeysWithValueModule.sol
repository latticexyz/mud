// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";
import { Module } from "../../Module.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { WorldContextConsumer } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";
import { revertWithBytes } from "../../revertWithBytes.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValueHook } from "./KeysWithValueHook.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that map to a given value.
 * from value to list of keys with this value. This mapping is stored in a table registered
 * by the module at the `targetTableId` provided in the install methods arguments.
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 *
 * Note: this module currently only supports `installRoot` (via `World.installRootModule`).
 * TODO: add support for `install` (via `World.installModule`) by using `callFrom` with the `msgSender()`
 */
contract KeysWithValueModule is Module {
  using ResourceSelector for bytes32;

  // The KeysWithValueHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  KeysWithValueHook private immutable hook = new KeysWithValueHook();

  function getName() public pure returns (bytes16) {
    return bytes16("index");
  }

  function installRoot(bytes memory args) public {
    // Extract source table id from args
    bytes32 sourceTableId = abi.decode(args, (bytes32));
    bytes32 targetTableSelector = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);

    IBaseWorld world = IBaseWorld(_world());

    // Register the target table
    KeysWithValue.register(world, targetTableSelector);

    // Grant the hook access to the target table
    world.grantAccess(targetTableSelector, address(hook));

    // Register a hook that is called when a value is set in the source table
    (bool success, bytes memory returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerStoreHook,
        (
          sourceTableId,
          hook,
          StoreHookLib.encodeBitmap({
            onBeforeSetRecord: true,
            onAfterSetRecord: false,
            onBeforeSetField: true,
            onAfterSetField: true,
            onBeforeDeleteRecord: true,
            onAfterDeleteRecord: false
          })
        )
      )
    );
    if (!success) revertWithBytes(returnData);
  }

  function install(bytes memory) public pure {
    revert NonRootInstallNotSupported();
  }
}
