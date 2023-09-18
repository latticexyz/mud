// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { BatchCallRootModule } from "../src/modules/batchcallroot/BatchCallRootModule.sol";

import { ResourceSelector } from "../src/ResourceSelector.sol";

import { WorldTestSystem } from "./World.t.sol";

contract BatchCallRootModuleTest is Test, GasReporter {
  using ResourceSelector for bytes32;

  IBaseWorld world;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
  }

  function testInstallRoot() public {
    startGasReport("installRoot batch call root module");
    world.installRootModule(new BatchCallRootModule(), new bytes(0));
    endGasReport();

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");

    world.registerSystem(resourceSelector, system, false);

    bytes32[] memory resourceSelectors = new bytes32[](2);
    bytes[] memory callDatas = new bytes[](2);

    resourceSelectors[0] = resourceSelector;
    callDatas[0] = abi.encodeWithSelector(WorldTestSystem.getStoreAddress.selector);
    resourceSelectors[1] = resourceSelector;
    callDatas[1] = abi.encodeWithSelector(WorldTestSystem.msgSender.selector);

    startGasReport("batch calling root");
    world.batchCall(resourceSelectors, callDatas);
    endGasReport();
  }
}
