// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { World } from "../src/World.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { Systems } from "../src/modules/core/tables/Systems.sol";
import { StandardDelegationsModule } from "../src/modules/std-delegations/StandardDelegationsModule.sol";
import { CallboundDelegationControl } from "../src/modules/std-delegations/CallboundDelegationControl.sol";
import { TimeboundDelegationControl } from "../src/modules/std-delegations/TimeboundDelegationControl.sol";
import { CALLBOUND_DELEGATION, TIMEBOUND_DELEGATION } from "../src/modules/std-delegations/StandardDelegationsModule.sol";

import { WorldTestSystem } from "./World.t.sol";

contract StandardDelegationsModuleTest is Test, GasReporter {
  IBaseWorld private world;
  bytes32 private systemResourceSelector = ResourceSelector.from("namespace", "testSystem");
  address private delegator = address(1);
  address private delegatee = address(2);

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    world.installRootModule(new StandardDelegationsModule(), new bytes(0));

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemResourceSelector, system, true);
  }

  function testCallFromCallboundDelegation() public {
    // Register the callbound delegation for one call to the system's msgSender function
    vm.prank(delegator);
    startGasReport("register a callbound delegation");
    world.registerDelegation(
      delegatee,
      CALLBOUND_DELEGATION,
      abi.encodeWithSelector(
        CallboundDelegationControl.initDelegation.selector,
        delegatee,
        systemResourceSelector,
        abi.encodeWithSelector(WorldTestSystem.msgSender.selector),
        1
      )
    );
    endGasReport();

    // Call a system from the delegatee on behalf of the delegator
    vm.prank(delegatee);
    startGasReport("call a system via a callbound delegation");
    bytes memory returnData = world.callFrom(
      delegator,
      systemResourceSelector,
      abi.encodeWithSelector(WorldTestSystem.msgSender.selector)
    );
    endGasReport();
    address returnedAddress = abi.decode(returnData, (address));

    // Expect the system to have received the delegator's address
    assertEq(returnedAddress, delegator);

    // Expect the delegation to have been used up
    vm.prank(delegatee);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.DelegationNotFound.selector, delegator, delegatee));
    world.callFrom(delegator, systemResourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));
  }

  function testCallFromTimeboundDelegation() public {
    uint256 maxTimestamp = 4242;

    // Set the current timestamp to 1
    vm.warp(1);

    // Register the timebound delegation
    vm.prank(delegator);
    startGasReport("register a timebound delegation");
    world.registerDelegation(
      delegatee,
      TIMEBOUND_DELEGATION,
      abi.encodeWithSelector(TimeboundDelegationControl.initDelegation.selector, delegatee, maxTimestamp)
    );
    endGasReport();

    // Call a system from the delegatee on behalf of the delegator
    vm.prank(delegatee);
    startGasReport("call a system via a timebound delegation");
    bytes memory returnData = world.callFrom(
      delegator,
      systemResourceSelector,
      abi.encodeWithSelector(WorldTestSystem.msgSender.selector)
    );
    endGasReport();
    address returnedAddress = abi.decode(returnData, (address));

    // Expect the system to have received the delegator's address
    assertEq(returnedAddress, delegator);

    // Set the timestamp to maxTimestamp and expect the delegation to still be valid
    vm.warp(maxTimestamp);
    vm.prank(delegatee);
    world.callFrom(delegator, systemResourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));

    // Set the timestamp to maxTimestamp+1 and expect the delegation to be expired
    vm.warp(maxTimestamp + 1);
    vm.prank(delegatee);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.DelegationNotFound.selector, delegator, delegatee));
    world.callFrom(delegator, systemResourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));
  }
}
