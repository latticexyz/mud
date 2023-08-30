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
import { DisposableDelegationControl } from "../src/modules/std-delegations/DisposableDelegationControl.sol";
import { DISPOSABLE_DELEGATION, DISPOSABLE_DELEGATION_ROOT } from "../src/modules/std-delegations/StandardDelegationsModule.sol";

import { WorldTestSystem } from "./World.t.sol";

contract StandardDelegationsModuleTest is Test, GasReporter {
  IBaseWorld world;
  bytes32 systemResourceSelector = ResourceSelector.from("namespace", "testSystem");
  address delegator = address(1);
  address delegatee = address(2);

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemResourceSelector, system, true);
  }

  function testCallFromDisposableDelegationRoot() public {
    // Install Delegations module as root module
    world.installRootModule(new StandardDelegationsModule(), new bytes(0));

    // Register the disposable delegation for one call to the system's msgSender function
    vm.prank(delegator);
    startGasReport("register a disposable delegation with a root module");
    world.registerDelegation(
      delegatee,
      DISPOSABLE_DELEGATION_ROOT,
      abi.encodeWithSelector(
        DisposableDelegationControl.initDelegation.selector,
        delegatee,
        systemResourceSelector,
        abi.encodeWithSelector(WorldTestSystem.msgSender.selector),
        1
      )
    );
    endGasReport();

    // Call a system from the delegatee on behalf of the delegator
    vm.prank(delegatee);
    startGasReport("call a system via a disposable delegation with a root module");
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
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.DelegationNotFound.selector, delegator, delegatee));
    vm.prank(delegatee);
    world.callFrom(delegator, systemResourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));
  }

  function testCallFromDisposableDelegation() public {
    // Install Delegations module as root module
    world.installModule(new StandardDelegationsModule(), new bytes(0));

    // Register the disposable delegation for one call to the system's msgSender function
    vm.prank(delegator);
    startGasReport("register a disposable delegation with a non-root module");
    world.registerDelegation(
      delegatee,
      DISPOSABLE_DELEGATION,
      abi.encodeWithSelector(
        DisposableDelegationControl.initDelegation.selector,
        delegatee,
        systemResourceSelector,
        abi.encodeWithSelector(WorldTestSystem.msgSender.selector),
        1
      )
    );
    endGasReport();

    // Call a system from the delegatee on behalf of the delegator
    vm.prank(delegatee);
    startGasReport("call a system via a disposable delegation with a non-root module");
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
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.DelegationNotFound.selector, delegator, delegatee));
    vm.prank(delegatee);
    world.callFrom(delegator, systemResourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));
  }
}
