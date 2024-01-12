// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { World } from "@latticexyz/world/src/World.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { DELEGATION_CONTROL_INTERFACE_ID } from "@latticexyz/world/src/IDelegationControl.sol";

import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { createCoreModule } from "@latticexyz/world/test/createCoreModule.sol";
import { Systems } from "@latticexyz/world/src/codegen/tables/Systems.sol";

import { PuppetModule } from "../src/modules/puppet/PuppetModule.sol";
import { PuppetDelegationControl } from "../src/modules/puppet/PuppetDelegationControl.sol";
import { Puppet } from "../src/modules/puppet/Puppet.sol";
import { PuppetMaster } from "../src/modules/puppet/PuppetMaster.sol";
import { PUPPET_DELEGATION } from "../src/modules/puppet/constants.sol";
import { createPuppet } from "../src/modules/puppet/createPuppet.sol";

contract PuppetTestSystem is System, PuppetMaster {
  event Hello(string message);

  function echoAndEmit(string memory message) public returns (string memory) {
    puppet().log(Hello.selector, abi.encode(message));
    return message;
  }

  function msgSender() public view returns (address) {
    return _msgSender();
  }
}

contract PuppetModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  event Hello(string msg);

  IBaseWorld private world;
  ResourceId private systemId =
    WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "namespace", name: "testSystem" });
  PuppetTestSystem private puppet;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(createCoreModule());
  }

  function _setupPuppet() internal {
    world.installModule(new PuppetModule(), new bytes(0));

    // Register a new namespace and system
    world.registerNamespace(systemId.getNamespaceId());
    PuppetTestSystem system = new PuppetTestSystem();
    world.registerSystem(systemId, system, true);

    // Connect the puppet
    puppet = PuppetTestSystem(createPuppet(world, systemId));
  }

  function _setupRootPuppet() internal {
    world.installRootModule(new PuppetModule(), new bytes(0));

    // Register a new system
    world.registerNamespace(systemId.getNamespaceId());
    PuppetTestSystem system = new PuppetTestSystem();
    world.registerSystem(systemId, system, true);

    // Connect the puppet
    puppet = PuppetTestSystem(createPuppet(world, systemId));
  }

  function testEmitOnPuppet() public {
    _setupPuppet();

    vm.expectEmit(true, true, true, true);
    emit Hello("hello world");
    string memory result = puppet.echoAndEmit("hello world");
    assertEq(result, "hello world");
  }

  function testMsgSender() public {
    _setupPuppet();

    assertEq(puppet.msgSender(), address(this));
  }

  function testEmitOnRootPuppet() public {
    _setupRootPuppet();

    vm.expectEmit(true, true, true, true);
    emit Hello("hello world");
    string memory result = puppet.echoAndEmit("hello world");
    assertEq(result, "hello world");
  }

  function testMsgSenderRootPuppet() public {
    _setupRootPuppet();

    assertEq(puppet.msgSender(), address(this));
  }
}
