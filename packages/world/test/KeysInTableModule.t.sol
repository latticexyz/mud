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
import { MODULE_NAMESPACE } from "../src/modules/keysintable/constants.sol";
import { KeysInTable } from "../src/modules/keysintable/tables/KeysInTable.sol";
import { getKeysInTable } from "../src/modules/keysintable/getKeysInTable.sol";
import { getTargetTableSelector } from "../src/modules/utils/getTargetTableSelector.sol";

contract KeysInTableModuleTest is Test {
  using ResourceSelector for bytes32;
  IBaseWorld world;
  KeysInTableModule keysInTableModule = new KeysInTableModule(); // Modules can be deployed once and installed multiple times

  bytes16 namespace = ROOT_NAMESPACE;
  bytes16 sourceFile = bytes16("source");
  bytes32 key1 = keccak256("test");
  bytes32[] keyTuple1;
  bytes32 key2 = keccak256("test2");
  bytes32[] keyTuple2;

  Schema sourceTableSchema;
  Schema sourceTableKeySchema;
  bytes32 sourceTableId;
  bytes32 targetTableId;

  function setUp() public {
    sourceTableSchema = SchemaLib.encode(SchemaType.UINT256);
    sourceTableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;
    sourceTableId = ResourceSelector.from(namespace, sourceFile);
    targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);
  }

  function _installkeysInTableModule() internal {
    // Register source table
    sourceTableId = world.registerTable(namespace, sourceFile, sourceTableSchema, sourceTableKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    // !gasreport install keys with table module
    world.installRootModule(keysInTableModule, abi.encode(sourceTableId));
  }

  function testInstall(uint256 value) public {
    _installkeysInTableModule();
    // Set a value in the source table
    // !gasreport set a record on a table with keysInTableModule installed
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value));

    // Get the list of keys in this target table
    bytes32[] memory keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0], key1);
  }

  function testSetAndDeleteRecordHook(uint256 value1, uint256 value2) public {
    _installkeysInTableModule();

    // Set a value in the source table
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value1));

    // Get the list of keys in the target table
    bytes32[] memory keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "1");
    assertEq(keysInTable[0], key1, "2");

    // Set another key with the same value
    world.setRecord(namespace, sourceFile, keyTuple2, abi.encodePacked(value1));

    // Get the list of keys in the target table
    keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0], key1, "3");
    assertEq(keysInTable[1], key2, "4");

    // Change the value of the first key
    // !gasreport change a record on a table with keysInTableModule installed
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2, "5");
    assertEq(keysInTable[1], key2, "6");

    // Get the list of keys in the target table
    keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2, "7");
    assertEq(keysInTable[0], key1, "8");

    // Delete the first key
    // !gasreport delete a record on a table with keysInTableModule installed
    world.deleteRecord(namespace, sourceFile, keyTuple1);

    // Get the list of keys in the target table
    keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "9");
  }

  function testSetField(uint256 value1, uint256 value2) public {
    _installkeysInTableModule();

    // Set a value in the source table
    // !gasreport set a field on a table with keysInTableModule installed
    world.setField(namespace, sourceFile, keyTuple1, 0, abi.encodePacked(value1));

    // Get the list of keys in the target table
    bytes32[] memory keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0], key1);

    // Change the value using setField
    // !gasreport change a field on a table with keysInTableModule installed
    world.setField(namespace, sourceFile, keyTuple1, 0, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);

    // Get the list of keys in the target table
    keysInTable = KeysInTable.get(world, targetTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0], key1);
  }

  function testGetTargetTableSelector() public {
    // !gasreport compute the target table selector
    bytes32 targetTableSelector = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);

    // The first 8 bytes are the module namespace
    assertEq(bytes8(targetTableSelector), MODULE_NAMESPACE);

    // followed by the first 4 bytes of the source table namespace
    assertEq(bytes8(targetTableSelector << 64), bytes8(namespace));

    // The last 16 bytes are the source file
    assertEq(targetTableSelector.getName(), sourceFile);
  }

  function testGetkeysInTable(uint256 value1) public {
    _installkeysInTableModule();

    // Set a value in the source table
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value1));

    // !gasreport Get list of keys in a given table
    bytes32[] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0], key1);

    // Set another key with the same value
    world.setRecord(namespace, sourceFile, keyTuple2, abi.encodePacked(value1));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0], key1);
    assertEq(keysInTable[1], key2);
  }
}
