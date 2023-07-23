// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";
import { ROOT_NAMESPACE } from "../src/constants.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { KeysWithValueModule } from "../src/modules/keyswithvalue/KeysWithValueModule.sol";
import { MODULE_NAMESPACE } from "../src/modules/keyswithvalue/constants.sol";
import { KeysWithValue, KeysWithValueData } from "../src/modules/keyswithvalue/tables/KeysWithValue.sol";
import { getKeysWithValue } from "../src/modules/keyswithvalue/getKeysWithValue.sol";
import { getTargetTableSelector } from "../src/modules/utils/getTargetTableSelector.sol";

contract KeysWithValueModuleTest is Test, GasReporter {
  using ResourceSelector for bytes32;
  IBaseWorld world;
  KeysWithValueModule keysWithValueModule = new KeysWithValueModule(); // Modules can be deployed once and installed multiple times

  bytes16 namespace = ROOT_NAMESPACE;
  bytes16 sourceName = bytes16("source");
  bytes16 compositeName = bytes16("composite");
  bytes32 key1 = keccak256("test");
  bytes32[] keyTuple1;
  bytes32 key2 = keccak256("test2");
  bytes32[] keyTuple2;
  bytes32 compositeKey1 = keccak256("testcomposite1");
  bytes32 compositeKey2 = keccak256("testcomposite2");
  bytes32[] compositeKeyTuple1;
  bytes32 compositeKey3 = keccak256("testcomposite3");
  bytes32 compositeKey4 = keccak256("testcomposite3");
  bytes32[] compositeKeyTuple2;

  Schema sourceTableSchema;
  Schema sourceTableKeySchema;
  Schema compositeTableSchema;
  Schema compositeTableKeySchema;
  bytes32 sourceTableId;
  bytes32 targetTableId;
  bytes32 compositeTableId;
  bytes32 targetCompositeTableId;

  function setUp() public {
    sourceTableSchema = SchemaLib.encode(SchemaType.UINT256);
    sourceTableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    compositeTableSchema = SchemaLib.encode(SchemaType.UINT256);
    compositeTableKeySchema = SchemaLib.encode(SchemaType.BYTES32, SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;
    compositeKeyTuple1 = new bytes32[](2);
    compositeKeyTuple1[0] = compositeKey1;
    compositeKeyTuple1[1] = compositeKey2;
    compositeKeyTuple2 = new bytes32[](2);
    compositeKeyTuple2[0] = compositeKey3;
    compositeKeyTuple2[1] = compositeKey4;
    sourceTableId = ResourceSelector.from(namespace, sourceName);
    targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);
    compositeTableId = ResourceSelector.from(namespace, compositeName);
    targetCompositeTableId = getTargetTableSelector(MODULE_NAMESPACE, compositeTableId);
  }

  function _installKeysWithValueModule() internal {
    // Register source table
    sourceTableId = world.registerTable(namespace, sourceName, sourceTableSchema, sourceTableKeySchema);
    compositeTableId = world.registerTable(namespace, compositeName, compositeTableSchema, compositeTableKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    startGasReport("install keys with value module");
    world.installRootModule(keysWithValueModule, abi.encode(sourceTableId));
    endGasReport();
    world.installRootModule(keysWithValueModule, abi.encode(compositeTableId));
  }

  function testInstall() public {
    _installKeysWithValueModule();
    // Set a value in the source table
    uint256 value = 1;

    startGasReport("set a record on a table with KeysWithValueModule installed");
    world.setRecord(namespace, sourceName, keyTuple1, abi.encodePacked(value));
    endGasReport();

    // Get the list of entities with this value from the target table
    KeysWithValueData memory keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1);
    assertEq(keysWithValue.keys0[0], key1);
  }

  function testInstallComposite() public {
    _installKeysWithValueModule();
    // Set a value in the source table
    uint256 value = 1;

    startGasReport("set a record on a table with KeysWithValueModule installed");
    world.setRecord(namespace, compositeName, compositeKeyTuple1, abi.encodePacked(value));
    endGasReport();

    // Get the list of entities with this value from the target table
    KeysWithValueData memory keysWithValue = KeysWithValue.get(
      world,
      targetCompositeTableId,
      keccak256(abi.encode(value))
    );

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1);
    assertEq(keysWithValue.keys0[0], compositeKey1);
    assertEq(keysWithValue.keys1.length, 1);
    assertEq(keysWithValue.keys1[0], compositeKey2);
  }

  function testSetAndDeleteRecordHook() public {
    _installKeysWithValueModule();

    // Set a value in the source table
    uint256 value1 = 1;

    world.setRecord(namespace, sourceName, keyTuple1, abi.encodePacked(value1));

    // Get the list of entities with value1 from the target table
    KeysWithValueData memory keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1, "1");
    assertEq(keysWithValue.keys0[0], key1, "2");

    // Set a another key with the same value
    world.setRecord(namespace, sourceName, keyTuple2, abi.encodePacked(value1));

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 2);
    assertEq(keysWithValue.keys0[0], key1, "3");
    assertEq(keysWithValue.keys0[1], key2, "4");

    // Change the value of the first key
    uint256 value2 = 2;

    startGasReport("change a record on a table with KeysWithValueModule installed");
    world.setRecord(namespace, sourceName, keyTuple1, abi.encodePacked(value2));
    endGasReport();

    // Get the list of entities with value1 from the target table
    keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1, "5");
    assertEq(keysWithValue.keys0[0], key2, "6");

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1, "7");
    assertEq(keysWithValue.keys0[0], key1, "8");

    // Delete the first key
    startGasReport("delete a record on a table with KeysWithValueModule installed");
    world.deleteRecord(namespace, sourceName, keyTuple1);
    endGasReport();

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 0, "9");
  }

  function testSetAndDeleteRecordHookComposite() public {
    _installKeysWithValueModule();

    // Set a value in the source table
    uint256 value1 = 1;

    world.setRecord(namespace, compositeName, compositeKeyTuple1, abi.encodePacked(value1));

    // Get the list of entities with value1 from the target table
    KeysWithValueData memory keysWithValue = KeysWithValue.get(
      world,
      targetCompositeTableId,
      keccak256(abi.encode(value1))
    );

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1, "1");
    assertEq(keysWithValue.keys1.length, 1, "2");
    assertEq(keysWithValue.keys0[0], compositeKey1, "3");
    assertEq(keysWithValue.keys1[0], compositeKey2, "4");

    // Set a another key with the same value
    world.setRecord(namespace, compositeName, compositeKeyTuple2, abi.encodePacked(value1));

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(world, targetCompositeTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 2);
    assertEq(keysWithValue.keys1.length, 2);
    assertEq(keysWithValue.keys0[0], compositeKey1, "5");
    assertEq(keysWithValue.keys1[0], compositeKey2, "7");
    assertEq(keysWithValue.keys0[1], compositeKey3, "6");
    assertEq(keysWithValue.keys1[1], compositeKey4, "8");

    // Change the value of the first key
    uint256 value2 = 2;

    startGasReport("change a record on a table with KeysWithValueModule installed");
    world.setRecord(namespace, compositeName, compositeKeyTuple1, abi.encodePacked(value2));
    endGasReport();

    // Get the list of entities with value1 from the target table
    keysWithValue = KeysWithValue.get(world, targetCompositeTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1, "9");
    assertEq(keysWithValue.keys1.length, 1, "10");
    assertEq(keysWithValue.keys0[0], compositeKey3, "11");
    assertEq(keysWithValue.keys1[0], compositeKey4, "12");

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(world, targetCompositeTableId, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1, "13");
    assertEq(keysWithValue.keys1.length, 1, "14");
    assertEq(keysWithValue.keys0[0], compositeKey1, "15");
    assertEq(keysWithValue.keys1[0], compositeKey2, "16");

    // Delete the first key
    startGasReport("delete a record on a table with KeysWithValueModule installed");
    world.deleteRecord(namespace, compositeName, compositeKeyTuple1);
    endGasReport();

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(world, targetCompositeTableId, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 0, "17");
    assertEq(keysWithValue.keys1.length, 0, "18");
  }

  function testSetField() public {
    _installKeysWithValueModule();

    // Set a value in the source table
    uint256 value1 = 1;

    startGasReport("set a field on a table with KeysWithValueModule installed");
    world.setField(namespace, sourceName, keyTuple1, 0, abi.encodePacked(value1));
    endGasReport();

    // Get the list of entities with value1 from the target table
    KeysWithValueData memory keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1);
    assertEq(keysWithValue.keys0[0], key1);

    uint256 value2 = 2;

    // Change the value using setField
    startGasReport("change a field on a table with KeysWithValueModule installed");
    world.setField(namespace, sourceName, keyTuple1, 0, abi.encodePacked(value2));
    endGasReport();

    // Get the list of entities with value1 from the target table
    keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 0);

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(world, targetTableId, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.keys0.length, 1);
    assertEq(keysWithValue.keys0[0], key1);
  }

  function testGetTargetTableSelector() public {
    startGasReport("compute the target table selector");
    bytes32 targetTableSelector = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);
    endGasReport();

    // The first 8 bytes are the module namespace
    assertEq(bytes8(targetTableSelector), MODULE_NAMESPACE);

    // followed by the first 4 bytes of the source table namespace
    assertEq(bytes8(targetTableSelector << 64), bytes8(namespace));

    // The last 16 bytes are the source name
    assertEq(targetTableSelector.getName(), sourceName);
  }

  function testGetKeysWithValueGas() public {
    // call fuzzed test manually to get gas report
    testGetKeysWithValue(1);
  }

  function testGetKeysWithValue(uint256 value) public {
    _installKeysWithValueModule();

    // Set a value in the source table
    world.setRecord(namespace, sourceName, keyTuple1, abi.encodePacked(value));

    startGasReport("Get list of keys with a given value");
    bytes32[][] memory keysWithValue = getKeysWithValue(world, sourceTableId, abi.encode(value));
    endGasReport();

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0].length, 1);
    assertEq(keysWithValue[0][0], key1);

    // // Set a another key with the same value
    world.setRecord(namespace, sourceName, keyTuple2, abi.encodePacked(value));

    // // Get the list of keys with value from the target table
    keysWithValue = getKeysWithValue(world, sourceTableId, abi.encode(value));

    // // Assert that the list is correct
    assertEq(keysWithValue.length, 2);
    assertEq(keysWithValue[0].length, 1);
    assertEq(keysWithValue[1].length, 1);
    assertEq(keysWithValue[0][0], key1);
    assertEq(keysWithValue[1][0], key2);
  }

  function testGetKeysWithValueCompositeGas() public {
    // call fuzzed test manually to get gas report
    testGetKeysWithValue(1);
  }

  function testGetKeysWithValueComposite(uint256 value) public {
    _installKeysWithValueModule();

    // Set a value in the source table
    world.setRecord(namespace, compositeName, compositeKeyTuple1, abi.encodePacked(value));

    startGasReport("Get list of keys with a given value");
    bytes32[][] memory keysWithValue = getKeysWithValue(world, compositeTableId, abi.encode(value));
    endGasReport();

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0].length, 2);
    assertEq(keysWithValue[0][0], compositeKey1);
    assertEq(keysWithValue[0][1], compositeKey2);

    // Set a another key with the same value
    world.setRecord(namespace, compositeName, compositeKeyTuple2, abi.encodePacked(value));

    // Get the list of keys with value from the target table
    keysWithValue = getKeysWithValue(world, compositeTableId, abi.encode(value));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 2);
    assertEq(keysWithValue[0].length, 2);
    assertEq(keysWithValue[1].length, 2);
    assertEq(keysWithValue[0][0], compositeKey1);
    assertEq(keysWithValue[0][1], compositeKey2);
    assertEq(keysWithValue[1][0], compositeKey3);
    assertEq(keysWithValue[1][1], compositeKey4);
  }
}
