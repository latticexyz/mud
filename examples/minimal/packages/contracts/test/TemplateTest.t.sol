// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
import { createInstance } from "@latticexyz/world/src/modules/factory/createInstance.sol";
import { FactoryContent } from "@latticexyz/world/src/modules/factory/tables/FactoryContent.sol";

import { createTemplates } from "../src/codegen/scripts/CreateTemplates.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { CounterTable, CounterTableTableId } from "../src/codegen/Tables.sol";
import { SimpleTemplateId } from "../src/codegen/Templates.sol";

contract TemplateTest is MudV2Test {
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
    assertEq(FactoryContent.get(world, SimpleTemplateId, CounterTableTableId), CounterTable.encode(420));

    bytes32[][] memory keys = new bytes32[][](1);
    keys[0] = CounterTable.encodeKeyTuple("test");

    createInstance(world, SimpleTemplateId, keys);

    assertEq(CounterTable.get(world, keys[0][0]), 420);
  }
}
