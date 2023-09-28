// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { FieldLayout, FieldLayoutLib } from "@latticexyz/store/src/FieldLayout.sol";
import { FieldLayoutEncodeHelper } from "@latticexyz/store/test/FieldLayoutEncodeHelper.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { SchemaEncodeHelper } from "@latticexyz/store/test/SchemaEncodeHelper.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { World } from "@latticexyz/world/src/World.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { RESOURCE_TABLE } from "@latticexyz/world/src/worldResourceTypes.sol";

import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { KeysInTableModule } from "../src/modules/keysintable/KeysInTableModule.sol";
import { getKeysInTable } from "../src/modules/keysintable/getKeysInTable.sol";
import { hasKey } from "../src/modules/keysintable/hasKey.sol";

contract KeysInTableModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld private world;
  KeysInTableModule private keysInTableModule = new KeysInTableModule(); // Modules can be deployed once and installed multiple times

  bytes14 private namespace = ROOT_NAMESPACE;
  bytes16 private name = bytes16("source");
  bytes16 private singletonName = bytes16("singleton");
  bytes16 private compositeName = bytes16("composite");
  bytes32 private key1 = keccak256("test");
  bytes32[] private keyTuple1;
  bytes32 private key2 = keccak256("test2");
  bytes32[] private keyTuple2;
  bytes32 private key3 = keccak256("test3");
  bytes32[] private keyTuple3;

  FieldLayout private tableFieldLayout;
  Schema private tableValueSchema;
  Schema private tableKeySchema;
  Schema private singletonKeySchema;
  Schema private compositeKeySchema;
  ResourceId private tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name });
  ResourceId private singletonTableId =
    WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: singletonName });
  ResourceId private compositeTableId =
    WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: compositeName });

  uint256 private val1 = 123;
  uint256 private val2 = 42;

  function setUp() public {
    tableFieldLayout = FieldLayoutEncodeHelper.encode(32, 0);

    tableValueSchema = SchemaEncodeHelper.encode(SchemaType.UINT256);
    tableKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);
    compositeKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32, SchemaType.BYTES32, SchemaType.BYTES32);
    singletonKeySchema = SchemaLib.encode(new SchemaType[](0));

    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
    keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;
    keyTuple3 = new bytes32[](1);
    keyTuple3[0] = key3;
  }

  function _installKeysInTableModule() internal {
    // Register source table
    world.registerTable(tableId, tableFieldLayout, tableKeySchema, tableValueSchema, new string[](1), new string[](1));
    world.registerTable(
      singletonTableId,
      tableFieldLayout,
      singletonKeySchema,
      tableValueSchema,
      new string[](0),
      new string[](1)
    );
    world.registerTable(
      compositeTableId,
      tableFieldLayout,
      compositeKeySchema,
      tableValueSchema,
      new string[](3),
      new string[](1)
    );

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    startGasReport("install keys in table module");
    world.installRootModule(keysInTableModule, abi.encode(tableId));
    endGasReport();
    world.installRootModule(keysInTableModule, abi.encode(singletonTableId));
    world.installRootModule(keysInTableModule, abi.encode(compositeTableId));
  }

  // This test is expected to fail because `getKeySchema()` on StoreCore reverts on singleton tables
  // TODO: we need to be able to determine whether a table is singleton vs. nonexistent
  function testInstallSingleton() public {
    _installKeysInTableModule();

    bytes32[] memory keyTuple = new bytes32[](0);

    world.setRecord(singletonTableId, keyTuple, abi.encodePacked(val1), PackedCounter.wrap(bytes32(0)), new bytes(0));

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

    world.setRecord(compositeTableId, keyTuple, abi.encodePacked(val1), PackedCounter.wrap(bytes32(0)), new bytes(0));

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
    // call fuzzed test manually to get gas report
    testInstall(val1);
  }

  function testInstall(uint256 value) public {
    _installKeysInTableModule();
    // Set a value in the source table
    startGasReport("set a record on a table with keysInTableModule installed");
    world.setRecord(tableId, keyTuple1, abi.encodePacked(value), PackedCounter.wrap(bytes32(0)), new bytes(0));
    endGasReport();

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
    startGasReport("set a record on a table with keysInTableModule installed (first)");
    world.setRecord(tableId, keyTuple, abi.encodePacked(value1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    endGasReport();

    // Get the list of keys in the first target table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], keyA);

    // Install the hook on the second table
    bytes16 sourceFile2 = bytes16("source2");
    ResourceId sourceTableId2 = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: namespace,
      name: sourceFile2
    });
    world.registerTable(
      sourceTableId2,
      tableFieldLayout,
      tableKeySchema,
      tableValueSchema,
      new string[](1),
      new string[](1)
    );
    world.installRootModule(keysInTableModule, abi.encode(sourceTableId2));

    keyTuple = new bytes32[](1);
    keyTuple[0] = keyB;

    // Set a value in the source table
    startGasReport("set a record on a table with keysInTableModule installed (second)");
    world.setRecord(sourceTableId2, keyTuple, abi.encodePacked(value2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    endGasReport();

    // Get the list of keys in the second target table
    keysInTable = getKeysInTable(world, sourceTableId2);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], keyB);
  }

  function testSetAndDeleteRecordHookGas() public {
    // call fuzzed test manually to get gas report
    testSetAndDeleteRecordHook(val1, val2);
  }

  function testSetAndDeleteRecordHook(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    // Set a value in the source table
    world.setRecord(tableId, keyTuple1, abi.encodePacked(value1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "1");
    assertEq(keysInTable[0][0], key1, "2");

    // Set another key with the same value
    world.setRecord(tableId, keyTuple2, abi.encodePacked(value1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1, "3");
    assertEq(keysInTable[1][0], key2, "4");

    // Change the value of the first key
    startGasReport("change a record on a table with keysInTableModule installed");
    world.setRecord(tableId, keyTuple1, abi.encodePacked(value2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    endGasReport();

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2, "5");
    assertEq(keysInTable[0][0], key1, "6");
    assertEq(keysInTable[1][0], key2, "7");

    // Delete the first key
    startGasReport("delete a record on a table with keysInTableModule installed");
    world.deleteRecord(tableId, keyTuple1);
    endGasReport();

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1, "8");
    assertEq(keysInTable[0][0], key2, "9");
  }

  function testSetAndDeleteRecordHookCompositeGas() public {
    // call fuzzed test manually to get gas report
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
    world.setRecord(
      compositeTableId,
      keyTupleA,
      abi.encodePacked(value1),
      PackedCounter.wrap(bytes32(0)),
      new bytes(0)
    );

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, compositeTableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    for (uint256 i; i < keyTupleA.length; i++) {
      assertEq(keysInTable[0][i], keyTupleA[i]);
    }

    // Set another key with the same value
    world.setRecord(
      compositeTableId,
      keyTupleB,
      abi.encodePacked(value1),
      PackedCounter.wrap(bytes32(0)),
      new bytes(0)
    );

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
    startGasReport("change a composite record on a table with keysInTableModule installed");
    world.setRecord(
      compositeTableId,
      keyTupleA,
      abi.encodePacked(value2),
      PackedCounter.wrap(bytes32(0)),
      new bytes(0)
    );
    endGasReport();

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
    startGasReport("delete a composite record on a table with keysInTableModule installed");
    world.deleteRecord(compositeTableId, keyTupleA);
    endGasReport();

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
    startGasReport("set a field on a table with keysInTableModule installed");
    world.setField(tableId, keyTuple1, 0, abi.encodePacked(value1), tableFieldLayout);
    endGasReport();

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);

    // Change the value using setField
    startGasReport("change a field on a table with keysInTableModule installed");
    world.setField(tableId, keyTuple1, 0, abi.encodePacked(value2), tableFieldLayout);
    endGasReport();

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);
  }

  function testGetKeysInTable(uint256 value1, uint256 value2) public {
    _installKeysInTableModule();

    // Set a value in the source table
    world.setRecord(tableId, keyTuple1, abi.encodePacked(value1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    startGasReport("Get list of keys in a given table");
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);
    endGasReport();

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);

    // Set another key with a different value
    world.setRecord(tableId, keyTuple2, abi.encodePacked(value2), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Get the list of keys in the target table
    keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 2);
    assertEq(keysInTable[0][0], key1);
    assertEq(keysInTable[1][0], key2);
  }

  function testDeleteFromMiddle(uint256 value) public {
    _installKeysInTableModule();

    // Add 3 values
    world.setRecord(tableId, keyTuple1, abi.encodePacked(value), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(tableId, keyTuple2, abi.encodePacked(value), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(tableId, keyTuple3, abi.encodePacked(value), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Remove 2, starting from the middle
    // This tests that KeysInTable correctly tracks swaps indexes
    world.deleteRecord(tableId, keyTuple2);
    world.deleteRecord(tableId, keyTuple3);

    // Get the list of keys in the target table
    bytes32[][] memory keysInTable = getKeysInTable(world, tableId);

    // Assert that the list is correct
    assertEq(keysInTable.length, 1);
    assertEq(keysInTable[0][0], key1);
  }
}
