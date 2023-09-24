// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { ResourceId, WorldResourceIdLib } from "../src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";

import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { SystemCallData } from "../src/modules/core/types.sol";

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

contract BatchCallTest is Test, GasReporter {
  IBaseWorld world;
  bytes14 namespace = "namespace";
  bytes16 name = "testSystem";

  ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
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
}
