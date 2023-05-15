// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { FactoryContent } from "../src/modules/factory/tables/FactoryContent.sol";
import { FactoryIndex } from "../src/modules/factory/tables/FactoryIndex.sol";
import { createInstance } from "../src/modules/factory/createInstance.sol";
import { createTemplate } from "../src/modules/factory/createTemplate.sol";
import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { ROOT_NAMESPACE } from "../src/constants.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { FactoryModule } from "../src/modules/factory/FactoryModule.sol";

contract FactoryModuleTest is Test {
  bytes16 namespace = ROOT_NAMESPACE;
  bytes16 name = bytes16("source");
  IBaseWorld world;
  FactoryModule factoryModule = new FactoryModule();

  Schema tableSchema;
  Schema tableKeySchema;
  bytes32 tableId;
  bytes32 templateId;

  function setUp() public {
    tableSchema = SchemaLib.encode(SchemaType.UINT256);
    tableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
  }

  function _installFactoryModule() internal {
    // Register table
    tableId = world.registerTable(namespace, name, tableSchema, tableKeySchema);

    // !gasreport install templates module
    world.installRootModule(factoryModule, new bytes(0));
  }

  function testInstallRoot() public {
    _installFactoryModule();
  }

  function testTemplates() public {
    _installFactoryModule();

    bytes32[] memory tableIds = new bytes32[](1);
    tableIds[0] = tableId;

    bytes[] memory values = new bytes[](1);
    values[0] = abi.encode(1);

    // !gasreport create a template
    createTemplate(world, templateId, tableIds, values);

    // Assert that the template content was set correctly
    assertEq(FactoryContent.get(world, templateId, tableId), abi.encode(1));

    // Create a template instance
    uint256 k1 = 1;

    bytes32[][] memory keys = new bytes32[][](1);
    keys[0] = new bytes32[](1);
    keys[0][0] = bytes32(k1);

    // !gasreport create an instance of a template
    createInstance(world, templateId, keys);

    assertEq(world.getRecord(tableId, keys[0]), abi.encode(1));
  }
}
