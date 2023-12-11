// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { getKeysWithValue } from "@latticexyz/world-modules/src/modules/keyswithvalue/getKeysWithValue.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Counter, CounterTableId } from "../src/codegen/index.sol";

contract CounterTest is MudTest {
  function testWorldExists() public {
    uint256 codeSize;
    address addr = worldAddress;
    assembly {
      codeSize := extcodesize(addr)
    }
    assertTrue(codeSize > 0);
  }

  function testCounter() public {
    // Expect the counter to be 1 because it was incremented in the PostDeploy script.
    uint32 counter = Counter.get();
    assertEq(counter, 1);

    // Expect the counter to be 2 after calling increment.
    IWorld(worldAddress).increment();
    counter = Counter.get();
    assertEq(counter, 2);
  }

  function testFailCounterSet() public {
    // These tests are sent by FOUNDRY_SENDER by default.
    // FOUNDRY_SENDER is not the deployer, so it does not have the right to set the counter.
    Counter.set(0);
  }

  function testCounterSet() public {
    // Run as the deployer address, which is allowed to set the counter.
    vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
    Counter.set(0);
    uint32 counter = Counter.get();
    assertEq(counter, 0);
  }
}
