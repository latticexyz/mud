// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { SystemCall } from "../src/modules/core/implementations/SystemCall.sol";

import { ResourceSelector } from "../src/ResourceSelector.sol";

address constant caller = address(1);

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
    admin = newAdmin;
  }

  function increment() public {
    require(_msgSender() == admin, "sender is not admin");

    counter++;
  }
}

contract CallBatchTest is Test, GasReporter {
  using ResourceSelector for bytes32;

  IBaseWorld world;
  bytes16 namespace = "namespace";
  bytes16 name = "testSystem";
  bytes32 resourceSelector = ResourceSelector.from(namespace, name);

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
  }

  function testCallBatch() public {
    // Register a new system
    TestSystem system = new TestSystem();
    world.registerSystem(resourceSelector, system, true);

    // Try to increment the counter without setting the admin
    SystemCall[] memory systemCalls = new SystemCall[](1);
    systemCalls[0] = SystemCall(resourceSelector, abi.encodeWithSelector(TestSystem.increment.selector));

    vm.expectRevert("sender is not admin");
    world.callBatch(systemCalls);

    // Set the admin and increment the counter twice
    systemCalls = new SystemCall[](3);
    systemCalls[0] = SystemCall(resourceSelector, abi.encodeWithSelector(TestSystem.setAdmin.selector, caller));
    systemCalls[1] = SystemCall(resourceSelector, abi.encodeWithSelector(TestSystem.increment.selector));
    systemCalls[2] = SystemCall(resourceSelector, abi.encodeWithSelector(TestSystem.increment.selector));

    vm.expectRevert("sender is not admin");
    world.callBatch(systemCalls);

    vm.prank(caller);
    world.callBatch(systemCalls);

    assertEq(system.counter(), 2, "wrong counter value");

    // Increment the counter again
    systemCalls = new SystemCall[](1);
    systemCalls[0] = SystemCall(resourceSelector, abi.encodeWithSelector(TestSystem.increment.selector));

    vm.prank(caller);
    world.callBatch(systemCalls);

    assertEq(system.counter(), 3, "wrong counter value");
  }

  function testCallBatchReturnData() public {
    // Register a new system
    TestSystem system = new TestSystem();
    world.registerSystem(resourceSelector, system, true);

    // Batch call functions on the system
    SystemCall[] memory systemCalls = new SystemCall[](2);

    systemCalls[0] = SystemCall(resourceSelector, abi.encodeWithSelector(TestSystem.msgSender.selector));
    systemCalls[1] = SystemCall(resourceSelector, abi.encodeWithSelector(TestSystem.getStoreAddress.selector));

    vm.prank(caller);
    startGasReport("call systems with callBatch");
    bytes[] memory datas = world.callBatch(systemCalls);
    endGasReport();

    assertEq(abi.decode(datas[0], (address)), caller, "wrong address returned");
    assertEq(abi.decode(datas[1], (address)), address(world), "wrong store returned");
  }
}
