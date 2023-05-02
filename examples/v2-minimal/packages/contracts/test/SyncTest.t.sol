// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
import { getKeysWithValue } from "@latticexyz/world/src/modules/keyswithvalue/getKeysWithValue.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

import { Record } from "../src/systems/SyncSystem.sol";
import { HealthTable, NameTable } from "../src/codegen/Tables.sol";

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

  function testSync(uint32[3] memory vals) public {
    Record[][] memory records = world.sync();

    assertEq(records[0].length, 0);

    vm.startPrank(address(world));
    HealthTable.set(world, "0", vals[0]);
    HealthTable.set(world, "1", vals[1]);
    vm.stopPrank();

    records = world.sync();

    assertEq(records[0][0].value, HealthTable.encode(vals[0]));
    assertEq(records[0][1].value, HealthTable.encode(vals[1]));

    vm.startPrank(address(world));
    HealthTable.set(world, "2", vals[2]);
    NameTable.set(world, "0", "Tycho");
    vm.stopPrank();

    records = world.sync();

    assertEq(records[0][0].value, HealthTable.encode(vals[0]));
    assertEq(records[0][1].value, HealthTable.encode(vals[1]));
    assertEq(records[0][2].value, HealthTable.encode(vals[2]));
    assertEq(records[1][0].value, NameTable.encode("Tycho"));
  }
}
