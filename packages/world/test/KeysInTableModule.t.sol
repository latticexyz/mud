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
  bytes16 name = bytes16("source");
  bytes16 singletonName = bytes16("singleton");
  bytes16 compositeName = bytes16("composite");
  bytes32 key1 = keccak256("test");
  bytes32[] keyTuple1;
  bytes32 key2 = keccak256("test2");
  bytes32[] keyTuple2;

  Schema tableSchema;
  Schema tableKeySchema;
  Schema singletonKeySchema;
  Schema compositeKeySchema;
  bytes32 tableId;
  bytes32 singletonTableId;
  bytes32 compositeTableId;

  uint256 val1 = 123;
  uint256 val2 = 42;

  function setUp() public {
    tableSchema = SchemaLib.encode(SchemaType.UINT256);
    tableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    compositeKeySchema = SchemaLib.encode(SchemaType.BYTES32, SchemaType.BYTES32, SchemaType.BYTES32);

    SchemaType[] memory _schema = new SchemaType[](0);
    singletonKeySchema = SchemaLib.encode(_schema);

    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;
  }

  function _installKeysInTableModule() internal {
    // Register source table
    tableId = world.registerTable(namespace, name, tableSchema, tableKeySchema);
    singletonTableId = world.registerTable(namespace, singletonName, tableSchema, singletonKeySchema);
    compositeTableId = world.registerTable(namespace, compositeName, tableSchema, compositeKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    // !gasreport install keys in table module
    world.installRootModule(keysInTableModule, abi.encode(tableId));
    world.installRootModule(keysInTableModule, abi.encode(singletonTableId));
    world.installRootModule(keysInTableModule, abi.encode(compositeTableId));
  }

  function testInstallSingleton() public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple = new bytes32[](0);

    world.setRecord(namespace, singletonName, keyTuple, abi.encodePacked(val1));

    // Get the list of keys in this target table
    bytes32[][] memory keysInTable = getKeysInTable(world, singletonTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 0);
  }

  function testInstallComposite() public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple = new bytes32[](3);
    keyTuple[0] = "one";
    keyTuple[1] = "two";
    keyTuple[2] = "three";

    world.setRecord(namespace, compositeName, keyTuple, abi.encodePacked(val1));

    // Get the list of keys in this target table
    bytes32[][] memory keysInTable = getKeysInTable(world, compositeTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0].length, keyTuple.length);
    for (uint256 i; i < keyTuple.length; i++) {
      assertEq(keysInTable[0][i], keyTuple[i]);
    }

    // Assert that the key tuple is in the source table
    assertTrue(hasKey(world, compositeTableId, keyTuple));
  }

  function testInstallGas() public {
    testInstall(val1);
  }

  function testInstall(uint256 value) public {
    _installKeysInTableModule();
    // Set a value in the source table
    // !gasreport set a record on a table with keysInTableModule installed
    world.setRecord(namespace, name, keyTuple1, abi.encodePacked(value));

    // Get the list of keys in this target table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

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
    world.setRecord(namespace, name, keyTuple, abi.encodePacked(value1));

    // Get the list of keys in the first target table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], keyA);

    // Install the hook on the second table
    bytes16 sourceFile2 = bytes16("source2");
    bytes32 sourceTableId2 = world.registerTable(namespace, sourceFile2, tableSchema, tableKeySchema);
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

  function testSetAndDeleteRecordHookGas() public {
    testSetAndDeleteRecordHook(val1, val2);
  }

  function testSetAndDeleteRecordHook(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    // Set a value in the source table
    world.setRecord(namespace, name, keyTuple1, abi.encodePacked(value1));

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "1");
    assertEq(keysInTable[0][0], key1, "2");

    // Set another key with the same value
    world.setRecord(namespace, name, keyTuple2, abi.encodePacked(value1));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1, "3");
    assertEq(keysInTable[1][0], key2, "4");

    // Change the value of the first key
    // !gasreport change a record on a table with keysInTableModule installed
    world.setRecord(namespace, name, keyTuple1, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2, "5");
    assertEq(keysInTable[0][0], key1, "6");
    assertEq(keysInTable[1][0], key2, "7");

    // Delete the first key
    // !gasreport delete a record on a table with keysInTableModule installed
    world.deleteRecord(namespace, name, keyTuple1);

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "8");
    assertEq(keysInTable[0][0], key2, "9");
  }

  function testSetAndDeleteRecordHookCompositeGas() public {
    testSetAndDeleteRecordHookComposite(val1, val2);
  }

  function testSetAndDeleteRecordHookComposite(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    bytes32[] memory keyTupleA = new bytes32[](3);
    keyTupleA[0] = "one";
    keyTupleA[1] = "two";
    keyTupleA[2] = "three";

    bytes32[] memory keyTupleB = new bytes32[](3);
    keyTupleB[0] = "alpha";
    keyTupleB[1] = "beta";
    keyTupleB[2] = "charlie";

    // Set a value in the source table
    world.setRecord(namespace, compositeName, keyTupleA, abi.encodePacked(value1));

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, compositeTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    for (uint256 i; i < keyTupleA.length; i++) {
      assertEq(keysInTable[0][i], keyTupleA[i]);
    }

    // Set another key with the same value
    world.setRecord(namespace, compositeName, keyTupleB, abi.encodePacked(value1));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, compositeTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    for (uint256 i; i < keyTupleA.length; i++) {
      assertEq(keysInTable[0][i], keyTupleA[i]);
    }
    for (uint256 i; i < keyTupleA.length; i++) {
      assertEq(keysInTable[1][i], keyTupleB[i]);
    }

    // Change the value of the first key
    // !gasreport change a composite record on a table with keysInTableModule installed
    world.setRecord(namespace, compositeName, keyTupleA, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, compositeTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    for (uint256 i; i < keyTupleA.length; i++) {
      assertEq(keysInTable[0][i], keyTupleA[i]);
    }
    for (uint256 i; i < keyTupleA.length; i++) {
      assertEq(keysInTable[1][i], keyTupleB[i]);
    }

    // Delete the first key
    // !gasreport delete a composite record on a table with keysInTableModule installed
    world.deleteRecord(namespace, compositeName, keyTupleA);

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, compositeTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    // for (uint256 i; i < keyTupleB.length; i++) {
    //   assertEq(keysInTable[0][i], keyTupleB[i]);
    // }
  }

  function testSetField(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    // Set a value in the source table
    // !gasreport set a field on a table with keysInTableModule installed
    world.setField(namespace, name, keyTuple1, 0, abi.encodePacked(value1));

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);

    // Change the value using setField
    // !gasreport change a field on a table with keysInTableModule installed
    world.setField(namespace, name, keyTuple1, 0, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);
  }

  function testGetKeysInTable(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    // Set a value in the source table
    world.setRecord(namespace, name, keyTuple1, abi.encodePacked(value1));

    // !gasreport Get list of keys in a given table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);

    // Set another key with a different value
    world.setRecord(namespace, name, keyTuple2, abi.encodePacked(value2));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1);
    assertEq(keysInTable[1][0], key2);
  }
}
