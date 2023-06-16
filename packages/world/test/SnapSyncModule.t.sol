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
import { SnapSyncModule } from "../src/modules/snapsync/SnapSyncModule.sol";
import { SyncRecord } from "../src/modules/snapsync/SyncRecord.sol";
import { getKeysInTable } from "../src/modules/keysintable/getKeysInTable.sol";
import { hasKey } from "../src/modules/keysintable/hasKey.sol";

interface ISnapSyncSystem {
  function snapSync_system_getRecords(
    bytes32 tableId,
    uint256 limit,
    uint256 offset
  ) external view returns (SyncRecord[] memory records);

  function snapSync_system_getNumKeysInTable(bytes32 tableId) external view returns (uint256);
}

contract SnapSyncModuleTest is Test {
  using ResourceSelector for bytes32;
  IBaseWorld world;
  KeysInTableModule keysInTableModule = new KeysInTableModule(); // Modules can be deployed once and installed multiple times
  SnapSyncModule snapSyncModule = new SnapSyncModule(); // Modules can be deployed once and installed multiple times

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

  function _installModules() internal {
    // Register source table
    tableId = world.registerTable(namespace, name, tableSchema, tableKeySchema);
    singletonTableId = world.registerTable(namespace, singletonName, tableSchema, singletonKeySchema);
    compositeTableId = world.registerTable(namespace, compositeName, tableSchema, compositeKeySchema);

    world.installRootModule(keysInTableModule, abi.encode(tableId));
    world.installRootModule(keysInTableModule, abi.encode(singletonTableId));
    world.installRootModule(keysInTableModule, abi.encode(compositeTableId));
    world.installRootModule(snapSyncModule, "");
  }

  function testSnapSync(uint256 value1, uint256 value2) public {
    _installModules();

    // Set a value in the source table
    world.setRecord(namespace, name, keyTuple1, abi.encodePacked(value1));

    uint256 limit = ISnapSyncSystem(address(world)).snapSync_system_getNumKeysInTable(tableId);

    // !gasreport Call snap sync on a table with 1 record
    SyncRecord[] memory records = ISnapSyncSystem(address(world)).snapSync_system_getRecords(tableId, limit, 0);

    // Assert that the list is correct
    assertEq(records.length, 1);
    assertEq(records[0].keyTuple[0], key1);
    assertEq(records[0].value, abi.encodePacked(value1));

    // Set another key with a different value
    world.setRecord(namespace, name, keyTuple2, abi.encodePacked(value2));

    limit = ISnapSyncSystem(address(world)).snapSync_system_getNumKeysInTable(tableId);

    // !gasreport Call snap sync on a table with 2 records
    records = ISnapSyncSystem(address(world)).snapSync_system_getRecords(tableId, limit, 0);

    // Assert that the list is correct
    assertEq(records.length, 2);
    assertEq(records[0].keyTuple[0], key1);
    assertEq(records[0].value, abi.encodePacked(value1));
    assertEq(records[1].keyTuple[0], key2);
    assertEq(records[1].value, abi.encodePacked(value2));
  }

  function testSnapSyncGas() public {
    testSnapSync(val1, val2);
  }

  function testSnapSyncComposite(uint256 value1, uint256 value2) public {
    _installModules();

    bytes32[] memory keyTupleA = new bytes32[](3);
    keyTupleA[0] = "A1";
    keyTupleA[1] = "A2";
    keyTupleA[2] = "A3";
    bytes32[] memory keyTupleB = new bytes32[](3);
    keyTupleB[0] = "B1";
    keyTupleB[1] = "B2";
    keyTupleB[2] = "B3";

    ISnapSyncSystem syncSystem = ISnapSyncSystem(address(world));

    // Set a value in the source table
    world.setRecord(namespace, compositeName, keyTupleA, abi.encodePacked(value1));

    uint256 limit = syncSystem.snapSync_system_getNumKeysInTable(compositeTableId);

    // !gasreport Call snap sync on a table with 1 record
    SyncRecord[] memory records = syncSystem.snapSync_system_getRecords(compositeTableId, limit, 0);

    // Assert that the list is correct
    assertEq(records.length, 1);
    for (uint256 i; i < 2; i++) {
      assertEq(records[0].keyTuple[i], keyTupleA[i]);
    }
    assertEq(records[0].value, abi.encodePacked(value1));

    // Set another key with a different value
    world.setRecord(namespace, compositeName, keyTupleB, abi.encodePacked(value2));

    limit = syncSystem.snapSync_system_getNumKeysInTable(compositeTableId);

    // !gasreport Call snap sync on a table with 2 records
    records = syncSystem.snapSync_system_getRecords(compositeTableId, limit, 0);

    // Assert that the list is correct
    assertEq(records.length, 2);
    for (uint256 i; i < 3; i++) {
      assertEq(records[0].keyTuple[i], keyTupleA[i]);
      assertEq(records[1].keyTuple[i], keyTupleB[i]);
    }
    assertEq(records[0].value, abi.encodePacked(value1));
    assertEq(records[1].value, abi.encodePacked(value2));
  }

  function testSnapSyncCompositeSameKey(uint256 value1, uint256 value2) public {
    _installModules();

    bytes32[] memory keyTupleA = new bytes32[](3);
    keyTupleA[0] = "KEY";
    keyTupleA[1] = "A2";
    keyTupleA[2] = "A3";
    bytes32[] memory keyTupleB = new bytes32[](3);
    keyTupleB[0] = "KEY";
    keyTupleB[1] = "B2";
    keyTupleB[2] = "B3";

    // Set a value in the source table
    world.setRecord(namespace, compositeName, keyTupleA, abi.encodePacked(value1));

    ISnapSyncSystem syncSystem = ISnapSyncSystem(address(world));

    uint256 limit = syncSystem.snapSync_system_getNumKeysInTable(compositeTableId);

    // !gasreport Call snap sync on a table with 1 record
    SyncRecord[] memory records = syncSystem.snapSync_system_getRecords(compositeTableId, limit, 0);

    // Assert that the list is correct
    assertEq(records.length, 1);
    for (uint256 i; i < 2; i++) {
      assertEq(records[0].keyTuple[i], keyTupleA[i]);
    }
    assertEq(records[0].value, abi.encodePacked(value1));

    // Set another key with a different value
    world.setRecord(namespace, compositeName, keyTupleB, abi.encodePacked(value2));

    limit = syncSystem.snapSync_system_getNumKeysInTable(compositeTableId);

    // !gasreport Call snap sync on a table with 2 records
    records = syncSystem.snapSync_system_getRecords(compositeTableId, limit, 0);

    // Assert that the list is correct
    assertEq(records.length, 2);
    for (uint256 i; i < 3; i++) {
      assertEq(records[0].keyTuple[i], keyTupleA[i]);
      assertEq(records[1].keyTuple[i], keyTupleB[i]);
    }
    assertEq(records[0].value, abi.encodePacked(value1));
    assertEq(records[1].value, abi.encodePacked(value2));
  }
}
