// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
import { getKeysWithValue } from "@latticexyz/world/src/modules/keyswithvalue/getKeysWithValue.sol";
import { createTemplates } from "../src/codegen/scripts/CreateTemplates.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { CounterTable, CounterTableTableId, TemplateContent } from "../src/codegen/Tables.sol";
import { SampleTemplateId } from "../src/codegen/Templates.sol";
import { createInstance } from "../src/scripts/CreateInstance.sol";

import { SingletonKey } from "../src/systems/IncrementSystem.sol";

contract CounterTest is MudV2Test {
  IWorld world;

  function setUp() public override {
    super.setUp();
    world = IWorld(worldAddress);
  }

  function testTemplates() public {
    vm.startPrank(worldAddress);

    // Create templates
    createTemplates(world);

    // Assert that the template content was set correctly
    assertEq(TemplateContent.get(world, SampleTemplateId, CounterTableTableId), CounterTable.encode(420));

    bytes32[][] memory keys = new bytes32[][](1);
    keys[0] = CounterTable.encodeKeyTuple("test");

    createInstance(world, SampleTemplateId, keys);

    assertEq(CounterTable.get(world, keys[0][0]), 420);
  }
}
