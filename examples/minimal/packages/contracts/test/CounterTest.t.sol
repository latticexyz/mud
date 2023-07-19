// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/store/src/MudTest.sol";
import { getKeysWithValue } from "@latticexyz/world/src/modules/keyswithvalue/getKeysWithValue.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { CounterTable, CounterTableTableId } from "../src/codegen/Tables.sol";

import { SingletonKey } from "../src/systems/IncrementSystem.sol";

contract CounterTest is MudTest {
  IWorld world;

  function setUp() public override {
    super.setUp();
    world = IWorld(worldAddress);
  }

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
    bytes32 key = SingletonKey;
    uint32 counter = CounterTable.get(key);
    assertEq(counter, 1);

    // Expect the counter to be 2 after calling increment.
    world.increment();
    counter = CounterTable.get(key);
    assertEq(counter, 2);
  }

  function testKeysWithValue() public {
    bytes32 key = SingletonKey;
    uint32 counter = CounterTable.get(key);
    bytes32[] memory keysWithValue = getKeysWithValue(CounterTableTableId, CounterTable.encode(counter));
    assertEq(keysWithValue.length, 1);
  }
}
