// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { UNLIMITED_DELEGATION } from "../src/constants.sol";
import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";

import { Systems } from "../src/modules/core/tables/Systems.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { BatchCallModule } from "../src/modules/batchcall/BatchCallModule.sol";
import { IBatchCallSystem } from "../src/interfaces/IBatchCallSystem.sol";

import { NAMESPACE, SYSTEM_NAME } from "../src/modules/batchcall/constants.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { WorldTestSystem } from "./World.t.sol";

contract BatchCallModuleTest is Test, GasReporter {
  using ResourceSelector for bytes32;

  IBaseWorld world;
  bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
    world.installModule(new BatchCallModule(), new bytes(0));

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(resourceSelector, system, false);
  }

  function testInstall() public {
    bytes32[] memory resourceSelectors = new bytes32[](2);
    bytes[] memory callDatas = new bytes[](2);

    resourceSelectors[0] = resourceSelector;
    callDatas[0] = abi.encodeWithSelector(WorldTestSystem.getStoreAddress.selector);
    resourceSelectors[1] = resourceSelector;
    callDatas[1] = abi.encodeWithSelector(WorldTestSystem.msgSender.selector);

    address delegatee = Systems.getSystem(world, ResourceSelector.from(NAMESPACE, SYSTEM_NAME));

    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.DelegationNotFound.selector, address(this), delegatee));
    IBatchCallSystem(address(world)).batchCall_system_batchCall(resourceSelectors, callDatas);

    // Register an unlimited delegation
    world.registerDelegation(delegatee, UNLIMITED_DELEGATION, new bytes(0));

    startGasReport("batch calling");
    IBatchCallSystem(address(world)).batchCall_system_batchCall(resourceSelectors, callDatas);
    endGasReport();
  }
}
