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

    vm.startPrank(address(world));
    for (uint i; i < keys.length; i++) {
      CounterTable.set(world, keys[i], vals[i]);
    }
    vm.stopPrank();

    Record[] memory records = world.getRecords(CounterTableTableId, 4, 0);
    assertTrue(records.length == 4);

    for (uint i; i < records.length; i++) {
      assertTrue(records[i].keyTuple[0] == keys[i]);
      assertEq(records[i].value, CounterTable.encode(vals[i]));
    }

    // only grab last key
    records = world.getRecords(CounterTableTableId, 1, 3);
    assertTrue(records.length == 1);

    assertTrue(records[0].keyTuple[0] == keys[3]);
    assertEq(records[0].value, CounterTable.encode(vals[3]));
  }

  function testSyncMany() public {
    uint256 amount = 1000;
    uint32 val = 1;

    vm.startPrank(worldAddress);
    for (uint256 i; i < amount; i++) {
      CounterTable.set(world, bytes32(i), val);
    }

    Record[] memory records = world.getRecords(CounterTableTableId, amount, 0);
    assertTrue(records.length == amount);

    uint256 length = world.getNumKeys(CounterTableTableId);
    assertTrue(length == amount + 1);
  }
}
