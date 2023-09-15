// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { ROOT_NAMESPACE, UNLIMITED_DELEGATION } from "../src/constants.sol";
import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { BatchCallModule } from "../src/modules/batchcall/BatchCallModule.sol";
import { IBatchCallSystem } from "../src/interfaces/IBatchCallSystem.sol";

import { NAMESPACE } from "../src/modules/batchcall/constants.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { WorldTestSystem } from "./World.t.sol";

contract BatchCallModuleTest is Test, GasReporter {
  using ResourceSelector for bytes32;

  IBaseWorld world;
  BatchCallModule batchCallModule = new BatchCallModule();

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
  }

  function testInstall() public {
    startGasReport("install batch call module");
    world.installModule(batchCallModule, new bytes(0));
    endGasReport();

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");

    world.registerSystem(resourceSelector, system, false);

    bytes32[] memory resourceSelectors = new bytes32[](1);
    bytes[] memory funcSelectorAndArgss = new bytes[](1);

    resourceSelectors[0] = resourceSelector;
    funcSelectorAndArgss[0] = abi.encodeWithSelector(WorldTestSystem.getStoreAddress.selector);

    // TODO: do not hardcode this
    address delegatee = 0x104fBc016F4bb334D775a19E8A6510109AC63E00;

    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.DelegationNotFound.selector, address(this), delegatee));
    IBatchCallSystem(address(world)).batchCall_system_batchCall(resourceSelectors, funcSelectorAndArgss);

    // Register an unlimited delegation
    world.registerDelegation(delegatee, UNLIMITED_DELEGATION, new bytes(0));

    IBatchCallSystem(address(world)).batchCall_system_batchCall(resourceSelectors, funcSelectorAndArgss);
  }

  function testInstallRoot() public {
    startGasReport("installRoot batch call module");
    world.installRootModule(batchCallModule, new bytes(0));
    endGasReport();

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");

    world.registerSystem(resourceSelector, system, false);

    bytes32[] memory resourceSelectors = new bytes32[](1);
    bytes[] memory funcSelectorAndArgss = new bytes[](1);

    resourceSelectors[0] = resourceSelector;
    funcSelectorAndArgss[0] = abi.encodeWithSelector(WorldTestSystem.getStoreAddress.selector);

    // TODO: do not hardcode this
    address delegatee = 0x104fBc016F4bb334D775a19E8A6510109AC63E00;

    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.DelegationNotFound.selector, address(this), delegatee));
    IBatchCallSystem(address(world)).batchCall_system_batchCall(resourceSelectors, funcSelectorAndArgss);

    // Register an unlimited delegation
    world.registerDelegation(delegatee, UNLIMITED_DELEGATION, new bytes(0));

    IBatchCallSystem(address(world)).batchCall_system_batchCall(resourceSelectors, funcSelectorAndArgss);
  }
}
