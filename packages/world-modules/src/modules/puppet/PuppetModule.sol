// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { PuppetFactorySystem } from "./PuppetFactorySystem.sol";
import { PuppetDelegationControl } from "./PuppetDelegationControl.sol";
import { PUPPET_DELEGATION, PUPPET_FACTORY, PUPPET_TABLE_ID, NAMESPACE_ID } from "./constants.sol";

import { PuppetRegistry } from "./tables/PuppetRegistry.sol";

/**
 * This module registers tables and delegation control systems required for puppet delegations
 */
contract PuppetModule is Module {
  using WorldResourceIdInstance for ResourceId;

  PuppetDelegationControl private immutable puppetDelegationControl = new PuppetDelegationControl();
  PuppetFactorySystem private immutable puppetFactorySystem = new PuppetFactorySystem();

  function installRoot(bytes memory) public override {
    IBaseWorld world = IBaseWorld(_world());

    // Register namespace
    (bool success, bytes memory returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerNamespace, (NAMESPACE_ID))
    );
    if (!success) revertWithBytes(returnData);

    // Register table
    PuppetRegistry.register(PUPPET_TABLE_ID);

    // Register puppet factory
    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (PUPPET_FACTORY, puppetFactorySystem, true))
    );
    if (!success) revertWithBytes(returnData);

    // Register puppet delegation control
    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (PUPPET_DELEGATION, puppetDelegationControl, true))
    );
    if (!success) revertWithBytes(returnData);
  }

  function install(bytes memory) public override {
    IBaseWorld world = IBaseWorld(_world());

    // Register namespace
    world.registerNamespace(NAMESPACE_ID);

    // Register table
    PuppetRegistry.register(PUPPET_TABLE_ID);

    // Register puppet factory and delegation control
    world.registerSystem(PUPPET_FACTORY, puppetFactorySystem, true);
    world.registerSystem(PUPPET_DELEGATION, puppetDelegationControl, true);
  }
}
