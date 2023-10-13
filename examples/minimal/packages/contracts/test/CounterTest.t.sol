// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { getKeysWithValue } from "@latticexyz/world-modules/src/modules/keyswithvalue/getKeysWithValue.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { CounterTable, CounterTableTableId } from "../src/codegen/index.sol";

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
    uint32 counter = CounterTable.get();
    assertEq(counter, 1);

    // Expect the counter to be 2 after calling increment.
    IWorld(worldAddress).increment();
    counter = CounterTable.get();
    assertEq(counter, 2);
  }

  // TODO: re-enable the KeysWithValueModule in mud.config.ts once it supports singleton keys
  // function testKeysWithValue() public {
  //   uint32 counter = CounterTable.get();
  //   bytes32[] memory keysWithValue = getKeysWithValue(CounterTableTableId, CounterTable.encode(counter));
  //   assertEq(keysWithValue.length, 1);
  // }
}
