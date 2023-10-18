// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { PuppetDelegationControl } from "./PuppetDelegationControl.sol";
import { MODULE_NAME, PUPPET_DELEGATION, PUPPET_TABLE_ID } from "./constants.sol";

import { PuppetRegistry } from "./tables/PuppetRegistry.sol";

/**
 * This module registers tables and delegation control systems required for puppet delegations
 */
contract PuppetModule is Module {
  PuppetDelegationControl private immutable puppetDelegationControl = new PuppetDelegationControl();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function installRoot(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register table
    PuppetRegistry.register(PUPPET_TABLE_ID);

    // Register system
    (bool success, bytes memory returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (PUPPET_DELEGATION, puppetDelegationControl, true))
    );
    if (!success) revertWithBytes(returnData);
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register table
    PuppetRegistry.register(PUPPET_TABLE_ID);

    // Register system
    world.registerSystem(PUPPET_DELEGATION, puppetDelegationControl, true);
  }
}
