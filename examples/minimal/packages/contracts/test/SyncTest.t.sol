// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

import { Record } from "../src/systems/SyncSystem.sol";
import { CounterTable, CounterTableTableId } from "../src/codegen/Tables.sol";

contract CounterTest is MudV2Test {
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

  function testSync(uint32[4] memory vals) public {
    bytes32[4] memory keys;
    keys[0] = bytes32(uint256(0x060D));
    keys[1] = "one";
    keys[2] = "two";
    keys[3] = "three";

    bytes32[] memory tableIds = new bytes32[](1);
    tableIds[0] = CounterTableTableId;

    Record[][] memory records = world.sync(tableIds);

    vm.startPrank(address(world));
    CounterTable.set(world, keys[1], vals[1]);
    CounterTable.set(world, keys[2], vals[2]);
    vm.stopPrank();

    records = world.sync(tableIds);

    assertEq(records.length, 1);
    // There is an extra record from PostDeploy
    assertEq(records[0].length, 3);
    for (uint256 i = 1; i < 3; i++) {
      assertEq(records[0][i].keyTuple.length, 1);
      assertEq(records[0][i].keyTuple[0], keys[i]);
      assertEq(records[0][i].value, CounterTable.encode(vals[i]));
    }

    vm.startPrank(address(world));
    CounterTable.set(world, keys[3], vals[3]);
    vm.stopPrank();

    records = world.sync(tableIds);

    assertEq(records.length, 1);
    assertEq(records[0].length, 4);
    for (uint256 i = 1; i < 4; i++) {
      assertEq(records[0][i].keyTuple.length, 1);
      assertEq(records[0][i].keyTuple[0], keys[i]);
      assertEq(records[0][i].value, CounterTable.encode(vals[i]));
    }
  }
}
