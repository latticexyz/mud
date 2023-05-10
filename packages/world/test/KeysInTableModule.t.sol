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
import { getKeysInTable } from "../src/modules/keysintable/getKeysInTable.sol";
import { hasKey } from "../src/modules/keysintable/hasKey.sol";

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

  uint256 val1 = 123;
  uint256 val2 = 42;

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
  }

  function _installKeysInTableModule() internal {
    // Register source table
    sourceTableId = world.registerTable(namespace, sourceFile, sourceTableSchema, sourceTableKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    // !gasreport install keys in table module
    world.installRootModule(keysInTableModule, abi.encode(sourceTableId));
  }

  function testInstall() public {
    _installKeysInTableModule();
    // Set a value in the source table
    // !gasreport set a record on a table with keysInTableModule installed
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(val1));

    // Get the list of keys in this target table
    bytes32[][] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);
  }

  function testInstallFuzz(uint256 value) public {
    _installKeysInTableModule();
    // Set a value in the source table
    // !gasreport set a record on a table with keysInTableModule installed
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value));

    // Get the list of keys in this target table
    bytes32[][] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);
  }

  function testInstallTwice(bytes32 keyA, bytes32 keyB, uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = keyA;

    // Set a value in the source table
    // !gasreport set a record on a table with keysInTableModule installed
    world.setRecord(namespace, sourceFile, keyTuple, abi.encodePacked(value1));

    // Get the list of keys in the first target table
    bytes32[][] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], keyA);

    // Install the hook on the second table
    bytes16 sourceFile2 = bytes16("source2");
    bytes32 sourceTableId2 = world.registerTable(namespace, sourceFile2, sourceTableSchema, sourceTableKeySchema);
    world.installRootModule(keysInTableModule, abi.encode(sourceTableId2));

    keyTuple = new bytes32[](1);
    keyTuple[0] = keyB;

    // Set a value in the source table
    // !gasreport set a record on a table with keysInTableModule installed
    world.setRecord(namespace, sourceFile2, keyTuple, abi.encodePacked(value2));

    // Get the list of keys in the second target table
    keysInTable = getKeysInTable(world, sourceTableId2);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], keyB);
  }

  function testSetAndDeleteRecordHook() public {
    _installKeysInTableModule();

    // Set a value in the source table
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(val1));

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "1");
    assertEq(keysInTable[0][0], key1, "2");

    // Set another key with the same value
    world.setRecord(namespace, sourceFile, keyTuple2, abi.encodePacked(val1));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1, "3");
    assertEq(keysInTable[1][0], key2, "4");

    // Change the value of the first key
    // !gasreport change a record on a table with keysInTableModule installed
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(val2));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2, "5");
    assertEq(keysInTable[0][0], key1, "6");
    assertEq(keysInTable[1][0], key2, "7");

    // Delete the first key
    // !gasreport delete a record on a table with keysInTableModule installed
    world.deleteRecord(namespace, sourceFile, keyTuple1);

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "8");
    assertEq(keysInTable[0][0], key2, "9");
  }

  function testSetAndDeleteRecordHookFuzz(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    // Set a value in the source table
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value1));

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "1");
    assertEq(keysInTable[0][0], key1, "2");

    // Set another key with the same value
    world.setRecord(namespace, sourceFile, keyTuple2, abi.encodePacked(value1));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1, "3");
    assertEq(keysInTable[1][0], key2, "4");

    // Change the value of the first key
    // !gasreport change a record on a table with keysInTableModule installed
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2, "5");
    assertEq(keysInTable[0][0], key1, "6");
    assertEq(keysInTable[1][0], key2, "7");

    // Delete the first key
    // !gasreport delete a record on a table with keysInTableModule installed
    world.deleteRecord(namespace, sourceFile, keyTuple1);

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "8");
    assertEq(keysInTable[0][0], key2, "9");
  }

  function testSetField(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    // Set a value in the source table
    // !gasreport set a field on a table with keysInTableModule installed
    world.setField(namespace, sourceFile, keyTuple1, 0, abi.encodePacked(value1));

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);

    // Change the value using setField
    // !gasreport change a field on a table with keysInTableModule installed
    world.setField(namespace, sourceFile, keyTuple1, 0, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);
  }

  function testGetKeysInTable(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    // Set a value in the source table
    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value1));

    // !gasreport Get list of keys in a given table
    bytes32[][] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);

    // Set another key with a different value
    world.setRecord(namespace, sourceFile, keyTuple2, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1);
    assertEq(keysInTable[1][0], key2);
  }

  // The KeysInTable module does not support composite keys yet,
  // so this checks that the tuple returned only contains the first key
  function testGetKeysInTableDoesNotSupportCompositeKeys(bytes32 keyA, bytes32 keyB, uint256 value1) public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple = new bytes32[](2);
    keyTuple[0] = keyA;
    keyTuple[1] = keyB;

    // Set a value in the source table
    world.setRecord(namespace, sourceFile, keyTuple, abi.encodePacked(value1));

    // !gasreport Get list of keys in a given table
    bytes32[][] memory keysInTable = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0].length, 1);
    assertEq(keysInTable[0][0], keyA);

    // Assert that the key tuple is in the source table
    assertTrue(hasKey(world, sourceTableId, keyTuple));
  }

  function testGetKeysWithValueMany10() public {
    _installKeysInTableModule();

    uint256 AMOUNT = 10;
    uint256 value = 1;

    bytes32[] memory lastKey = new bytes32[](1);
    lastKey[0] = bytes32(uint256(AMOUNT - 1));

    for (uint256 i; i < AMOUNT - 1; i++) {
      bytes32[] memory key = new bytes32[](1);
      key[0] = bytes32(i);
      world.setRecord(namespace, sourceFile, key, abi.encodePacked(value));
    }

    // !gasreport Setting the last of 10 keys
    world.setRecord(namespace, sourceFile, lastKey, abi.encodePacked(value));

    // !gasreport Get list of 10 keys with a given value
    bytes32[][] memory keyTuples = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keyTuples.length, AMOUNT);
  }

  function testGetKeysWithValueMany100() public {
    _installKeysInTableModule();

    uint256 AMOUNT = 100;
    uint256 value = 1;

    bytes32[] memory lastKey = new bytes32[](1);
    lastKey[0] = bytes32(uint256(AMOUNT - 1));

    for (uint256 i; i < AMOUNT - 1; i++) {
      bytes32[] memory key = new bytes32[](1);
      key[0] = bytes32(i);
      world.setRecord(namespace, sourceFile, key, abi.encodePacked(value));
    }

    // !gasreport Setting the last of 100 keys
    world.setRecord(namespace, sourceFile, lastKey, abi.encodePacked(value));

    // !gasreport Get list of 100 keys with a given value
    bytes32[][] memory keyTuples = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keyTuples.length, AMOUNT);
  }

  function testGetKeysWithValueMany1000() public {
    _installKeysInTableModule();

    uint256 AMOUNT = 1000;
    uint256 value = 1;

    bytes32[] memory lastKey = new bytes32[](1);
    lastKey[0] = bytes32(uint256(AMOUNT - 1));

    for (uint256 i; i < AMOUNT - 1; i++) {
      bytes32[] memory key = new bytes32[](1);
      key[0] = bytes32(i);
      world.setRecord(namespace, sourceFile, key, abi.encodePacked(value));
    }

    // !gasreport Setting the last of 1000 keys
    world.setRecord(namespace, sourceFile, lastKey, abi.encodePacked(value));

    // !gasreport Get list of 1000 keys with a given value
    bytes32[][] memory keyTuples = getKeysInTable(world, sourceTableId);

    // Assert that the list is correct
    assertEq(keyTuples.length, AMOUNT);
  }
}
