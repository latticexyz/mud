// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";
import { ROOT_NAMESPACE } from "../src/constants.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { KeysInTableModule } from "../src/modules/keysintable/KeysInTableModule.sol";
import { query } from "../src/modules/keysintable/query.sol";

// Set up multiple tables
// Install the module on both
contract queryTest is Test {
  using ResourceSelector for bytes32;
  IBaseWorld world;
  KeysInTableModule keysInTableModule = new KeysInTableModule(); // Modules can be deployed once and installed multiple times

  bytes16 namespace = ROOT_NAMESPACE;
  bytes16 sourceFileA = bytes16("sourceA");
  bytes16 sourceFileB = bytes16("sourceB");

  Schema sourceTableSchema;
  Schema sourceTableKeySchema;
  bytes32 sourceTableIdA = ResourceSelector.from(namespace, sourceFileA);
  bytes32 sourceTableIdB = ResourceSelector.from(namespace, sourceFileB);

  function setUp() public {
    sourceTableSchema = SchemaLib.encode(SchemaType.UINT256);
    sourceTableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
  }

  function _installKeysInTableModule() internal {
    // Register source table
    sourceTableIdA = world.registerTable(namespace, sourceFileA, sourceTableSchema, sourceTableKeySchema);
    sourceTableIdB = world.registerTable(namespace, sourceFileB, sourceTableSchema, sourceTableKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    // !gasreport install keys in table module
    world.installRootModule(keysInTableModule, abi.encode(sourceTableIdA));
    world.installRootModule(keysInTableModule, abi.encode(sourceTableIdB));
  }

  function testQuery(bytes32 key1, bytes32 key2, uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;

    // Set a value in the source table
    world.setRecord(namespace, sourceFileA, keyTuple1, abi.encodePacked(value1));

    bytes32[] memory tableIds = new bytes32[](1);
    tableIds[0] = sourceTableIdA;

    // !gasreport Get list of keys in a given table
    bytes32[][] memory keysInTable = query(world, tableIds);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);

    // Set another key with a different value
    world.setRecord(namespace, sourceFileA, keyTuple2, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = query(world, tableIds);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1);
    assertEq(keysInTable[1][0], key2);
  }

  // Put key1 and key2 into tableA. put only key1 in tableB
  function testQueryMultiple(bytes32 key1, bytes32 key2, uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = sourceTableIdA;
    tableIds[1] = sourceTableIdB;

    // Set key1 in both tables
    world.setRecord(namespace, sourceFileA, keyTuple1, abi.encodePacked(value1));
    world.setRecord(namespace, sourceFileB, keyTuple1, abi.encodePacked(value1));

    // but set key2 in one table
    world.setRecord(namespace, sourceFileA, keyTuple2, abi.encodePacked(value2));

    // !gasreport Get list of keys in a given table
    bytes32[][] memory keysInTable = query(world, tableIds);

    // Assert that the list is the intersection of both table keys
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);
  }

  function testQueryMultiple2(bytes32 key1, bytes32 key2, uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = sourceTableIdA;
    tableIds[1] = sourceTableIdB;

    // Set key1 in both tables
    world.setRecord(namespace, sourceFileA, keyTuple1, abi.encodePacked(value1));

    // but set key2 in one table
    world.setRecord(namespace, sourceFileA, keyTuple1, abi.encodePacked(value2));
    world.setRecord(namespace, sourceFileB, keyTuple2, abi.encodePacked(value1));

    // !gasreport Get list of keys in a given table
    bytes32[][] memory keysInTable = query(world, tableIds);

    // Assert that the list is the intersection of both table keys
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);
  }

  function testQueryMultiple3(bytes32 key1, bytes32 key2, uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = sourceTableIdA;
    tableIds[1] = sourceTableIdB;

    // Set key1 in both tables
    world.setRecord(namespace, sourceFileA, keyTuple1, abi.encodePacked(value1));

    // but set key2 in one table
    world.setRecord(namespace, sourceFileA, keyTuple1, abi.encodePacked(value2));
    world.setRecord(namespace, sourceFileB, keyTuple2, abi.encodePacked(value1));

    // !gasreport Get list of keys in a given table
    bytes32[][] memory keysInTable = query(world, tableIds);

    // Assert that the list is the intersection of both table keys
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1);
    assertEq(keysInTable[1][0], key1);
  }
}
