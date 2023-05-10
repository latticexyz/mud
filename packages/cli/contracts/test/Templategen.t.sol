// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreReadWithStubs } from "@latticexyz/store/src/StoreReadWithStubs.sol";
import { createInstance } from "@latticexyz/world/src/modules/templates/createInstance.sol";
import { TemplateContent } from "@latticexyz/world/src/modules/templates/tables/TemplateContent.sol";
import { TemplateIndex } from "@latticexyz/world/src/modules/templates/tables/TemplateIndex.sol";

import { Statics, StaticsTableId, StaticsData } from "../src/codegen/Tables.sol";
import { ExampleTemplateId } from "../src/codegen/Templates.sol";
import { createTemplates } from "../src/codegen/scripts/CreateTemplates.sol";

import { Enum1, Enum2 } from "../src/codegen/Types.sol";

contract TemplateTest is Test, StoreReadWithStubs {
  function testTemplates() public {
    Statics.registerSchema();
    TemplateContent.registerSchema();
    TemplateIndex.registerSchema();

    // !gasreport create a template
    createTemplates();

    // Assert that the template content was set correctly
    assertEq(
      TemplateContent.get(ExampleTemplateId, StaticsTableId),
      Statics.encode(1, 1, "wasd", 0x71C7656EC7ab88b098defB751B7401B5f6d8976F, true, Enum1.E1, Enum2.E1)
    );

    // Create a template instance
    uint256 k1 = 1;
    int32 k2 = -1;
    bytes16 k3 = hex"02";
    address k4 = address(123);
    bool k5 = true;
    Enum1 k6 = Enum1.E3;
    Enum2 k7 = Enum2.E1;

    bytes32[][] memory keys = new bytes32[][](1);
    keys[0] = Statics.encodeKeyTuple(k1, k2, k3, k4, k5, k6, k7);

    // !gasreport create an instance of a template
    createInstance(ExampleTemplateId, keys);

    // Assert that the instance was created properly
    StaticsData memory data = StaticsData(
      1,
      1,
      "wasd",
      0x71C7656EC7ab88b098defB751B7401B5f6d8976F,
      true,
      Enum1.E1,
      Enum2.E1
    );
    assertEq(abi.encode(Statics.get(k1, k2, k3, k4, k5, k6, k7)), abi.encode(data));
  }
}
