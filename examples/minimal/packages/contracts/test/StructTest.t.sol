// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
import { getKeysWithValue } from "@latticexyz/world/src/modules/keyswithvalue/getKeysWithValue.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { CounterTable, CounterTableTableId } from "../src/codegen/Tables.sol";
import { BytesStruct, StringStruct } from "../src/systems/structs.sol";

contract StructTest is MudV2Test {
  IWorld world;

  function setUp() public override {
    super.setUp();
    world = IWorld(worldAddress);
  }

  function testStaticBytes() public {
    BytesStruct[1] memory structs;

    world.staticArrayBytesStruct(structs);
  }

  function testDynamicBytes() public {
    BytesStruct[] memory structs = new BytesStruct[](1);

    world.dynamicArrayBytesStruct(structs);
  }

  function testStaticString() public {
    StringStruct[1] memory structs;

    world.staticArrayStringStruct(structs);
  }

  function testDynamicString() public {
    StringStruct[] memory structs = new StringStruct[](1);

    world.dynamicArrayStringStruct(structs);
  }
}
