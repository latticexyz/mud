// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { UNLIMITED_DELEGATION } from "../src/constants.sol";
import { ResourceId, WorldResourceIdLib } from "../src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";

import { IWorldErrors } from "../src/IWorldErrors.sol";
import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { SystemCallData, SystemCallFromData } from "../src/modules/core/types.sol";

import { createCoreModule } from "./createCoreModule.sol";

address constant caller = address(1);
address constant delegator = address(2);
address constant delegatee = address(3);

contract TestSystem is System {
  address public admin;
  uint256 public counter;

  function getStoreAddress() public view returns (address) {
    return StoreSwitch.getStoreAddress();
  }

  function msgSender() public view returns (address) {
    return _msgSender();
  }

  function setAdmin(address newAdmin) public {
    if (admin != address(0) && _msgSender() != admin) {
      revert("sender is not admin");
    }
    admin = newAdmin;
  }

  function increment() public {
    require(_msgSender() == admin, "sender is not admin");

    counter++;
  }
}

contract BatchCallTest is Test, GasReporter {
  IBaseWorld world;
  bytes14 namespace = "namespace";
  bytes16 name = "testSystem";

  ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(createCoreModule());
  }

  function testBatchCall() public {
    // Register a new system
    TestSystem system = new TestSystem();
    world.registerSystem(systemId, system, true);

    // Try to increment the counter without setting the admin
    SystemCallData[] memory systemCalls = new SystemCallData[](1);
    systemCalls[0] = SystemCallData(systemId, abi.encodeCall(TestSystem.increment, ()));

    vm.expectRevert("sender is not admin");
    world.batchCall(systemCalls);

    // Set the admin and increment the counter twice
    systemCalls = new SystemCallData[](3);
    systemCalls[0] = SystemCallData(systemId, abi.encodeCall(TestSystem.setAdmin, (caller)));
    systemCalls[1] = SystemCallData(systemId, abi.encodeCall(TestSystem.increment, ()));
    systemCalls[2] = SystemCallData(systemId, abi.encodeCall(TestSystem.increment, ()));

    vm.expectRevert("sender is not admin");
    world.batchCall(systemCalls);

    vm.prank(caller);
    world.batchCall(systemCalls);

    assertEq(system.counter(), 2, "wrong counter value");

    // Increment the counter again
    systemCalls = new SystemCallData[](1);
    systemCalls[0] = SystemCallData(systemId, abi.encodeCall(TestSystem.increment, ()));

    vm.prank(caller);
    world.batchCall(systemCalls);

    assertEq(system.counter(), 3, "wrong counter value");
  }

  function testBatchCallReturnData() public {
    // Register a new system
    TestSystem system = new TestSystem();
    world.registerSystem(systemId, system, true);

    // Batch call functions on the system
    SystemCallData[] memory systemCalls = new SystemCallData[](2);

    systemCalls[0] = SystemCallData(systemId, abi.encodeCall(TestSystem.msgSender, ()));
    systemCalls[1] = SystemCallData(systemId, abi.encodeCall(TestSystem.getStoreAddress, ()));

    vm.prank(caller);
    startGasReport("call systems with batchCall");
    bytes[] memory returnDatas = world.batchCall(systemCalls);
    endGasReport();

    assertEq(abi.decode(returnDatas[0], (address)), caller, "wrong address returned");
    assertEq(abi.decode(returnDatas[1], (address)), address(world), "wrong store returned");
  }

  function testBatchCallFrom() public {
    // Register a new system
    TestSystem system = new TestSystem();
    world.registerSystem(systemId, system, true);

    // Try to increment the counter without creating a delegation
    SystemCallFromData[] memory systemCalls = new SystemCallFromData[](1);
    systemCalls[0] = SystemCallFromData(delegator, systemId, abi.encodeCall(TestSystem.increment, ()));

    vm.prank(delegatee);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_DelegationNotFound.selector, delegator, delegatee));
    world.batchCallFrom(systemCalls);

    // Create an unlimited delegation
    vm.prank(delegator);
    world.registerDelegation(delegatee, UNLIMITED_DELEGATION, new bytes(0));

    // Try to increment the counter without setting the admin
    vm.prank(delegatee);
    vm.expectRevert("sender is not admin");
    world.batchCallFrom(systemCalls);

    // Set the admin and increment the counter twice
    systemCalls = new SystemCallFromData[](4);
    systemCalls[0] = SystemCallFromData(delegatee, systemId, abi.encodeCall(TestSystem.setAdmin, (delegator)));
    systemCalls[1] = SystemCallFromData(delegator, systemId, abi.encodeCall(TestSystem.increment, ()));
    systemCalls[2] = SystemCallFromData(delegator, systemId, abi.encodeCall(TestSystem.setAdmin, (delegatee)));
    systemCalls[3] = SystemCallFromData(delegatee, systemId, abi.encodeCall(TestSystem.increment, ()));

    vm.prank(delegatee);
    world.batchCallFrom(systemCalls);

    assertEq(system.counter(), 2, "wrong counter value");
  }

  function testBatchCallFromReturnData() public {
    // Register a new system
    TestSystem system = new TestSystem();
    world.registerSystem(systemId, system, true);

    // Create an unlimited delegation
    vm.prank(delegator);
    world.registerDelegation(delegatee, UNLIMITED_DELEGATION, new bytes(0));

    // Batch call functions on the system
    SystemCallFromData[] memory systemCalls = new SystemCallFromData[](2);

    systemCalls[0] = SystemCallFromData(delegatee, systemId, abi.encodeCall(TestSystem.msgSender, ()));
    systemCalls[1] = SystemCallFromData(delegator, systemId, abi.encodeCall(TestSystem.msgSender, ()));

    vm.prank(delegatee);
    startGasReport("call systems with batchCallFrom");
    bytes[] memory returnDatas = world.batchCallFrom(systemCalls);
    endGasReport();

    assertEq(abi.decode(returnDatas[0], (address)), delegatee, "wrong delegatee returned");
    assertEq(abi.decode(returnDatas[1], (address)), delegator, "wrong delegator returned");
  }
}
