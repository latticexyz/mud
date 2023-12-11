// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Tasks, TasksData } from "../src/codegen/index.sol";

contract TasksTest is MudTest {
  function testWorldExists() public {
    uint256 codeSize;
    address addr = worldAddress;
    assembly {
      codeSize := extcodesize(addr)
    }
    assertTrue(codeSize > 0);
  }

  function testTasks() public {
    // Expect task to exist that we created during PostDeploy script
    TasksData memory task = Tasks.get("1");
    assertEq(task.description, "Walk the dog");
    assertEq(task.completedAt, 0);

    // Expect the task to be completed after calling completeTask from our TasksSystem
    IWorld(worldAddress).completeTask("1");
    assertEq(Tasks.getCompletedAt("1"), block.timestamp);
  }

  function testFailSet() public {
    // These tests are sent by FOUNDRY_SENDER by default.
    // FOUNDRY_SENDER is not the deployer, so it does not have the right to set the counter.
    bytes32 taskKey = bytes32(uint256(100));
    Tasks.set(taskKey, uint256(0), uint256(0), "Extra task");
  }

  function testSet() public {
    // Run as the deployer address, which is allowed to set the counter.
    vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));

    bytes32 taskKey = bytes32("100");
    Tasks.set(taskKey, uint256(1), uint256(1), "Extra task");

    // Verify the task
    TasksData memory task = Tasks.get(taskKey);
    assertEq(task.description, "Extra task");
    assertEq(task.completedAt, 1);
  }
}
