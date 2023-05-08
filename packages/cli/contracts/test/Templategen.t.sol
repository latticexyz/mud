// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreReadWithStubs } from "@latticexyz/store/src/StoreReadWithStubs.sol";

import { Statics, StaticsTableId, StaticsData, Counter, CounterTableId, TemplateContent, TemplateIndex } from "../src/codegen/Tables.sol";
import { ExampleTemplateId } from "../src/codegen/Templates.sol";
import { createTemplates } from "../src/codegen/scripts/CreateTemplates.sol";
import { createInstance } from "../src/scripts/CreateInstance.sol";

import { Enum1, Enum2 } from "../src/codegen/Types.sol";

contract TemplateTest is Test, StoreReadWithStubs {
  function testTemplates() public {
    Statics.registerSchema();
    Counter.registerSchema();
    TemplateContent.registerSchema();
    TemplateIndex.registerSchema();

    // Create templates
    createTemplates();

    // Assert that the template content was set correctly
    assertEq(TemplateContent.get(ExampleTemplateId, CounterTableId), Counter.encode(2));

    // Create an instance
    bytes32[][] memory keys = new bytes32[][](2);
    keys[0] = new bytes32[](7);
    keys[1] = new bytes32[](1);

    createInstance(ExampleTemplateId, keys);

    // Assert that the instance was create properly
    assertEq(Counter.get(keys[1][0]), 2);

    // TODO: how to test statics?
  }
}
