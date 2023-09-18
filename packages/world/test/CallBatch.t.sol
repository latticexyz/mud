// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";

import { ResourceSelector } from "../src/ResourceSelector.sol";

import { WorldTestSystem } from "./World.t.sol";

address constant caller = address(0x01);

contract CallBatchTest is Test, GasReporter {
  using ResourceSelector for bytes32;

  IBaseWorld world;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
  }

  function testCallBatch() public {
    bytes16 namespace = "namespace";
    bytes16 name = "testSystem";
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(resourceSelector, system, true);

    // Batch call functions on the system
    bytes32[] memory resourceSelectors = new bytes32[](2);
    bytes[] memory callDatas = new bytes[](2);

    resourceSelectors[0] = resourceSelector;
    callDatas[0] = abi.encodeWithSelector(WorldTestSystem.msgSender.selector);
    resourceSelectors[1] = resourceSelector;
    callDatas[1] = abi.encodeWithSelector(WorldTestSystem.getStoreAddress.selector);

    vm.prank(caller);
    startGasReport("call systems with callBatch");
    bytes[] memory datas = world.callBatch(resourceSelectors, callDatas);
    endGasReport();

    assertEq(abi.decode(datas[0], (address)), caller, "wrong address returned");
    assertEq(abi.decode(datas[1], (address)), address(world), "wrong store returned");
  }
}
