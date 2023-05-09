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
import { KeysWithValueModule } from "../src/modules/keyswithvalue/KeysWithValueModule.sol";
import { getKeysWithValue } from "../src/modules/keyswithvalue/getKeysWithValue.sol";

contract KeysWithValueModuleTest is Test {
  using ResourceSelector for bytes32;
  IBaseWorld world;
  KeysWithValueModule keysWithValueModule = new KeysWithValueModule(); // Modules can be deployed once and installed multiple times

  bytes16 namespace = ROOT_NAMESPACE;
  bytes16 sourceName = bytes16("source");
  bytes32 key1 = keccak256("test");
  bytes32[] keyTuple1;
  bytes32 key2 = keccak256("test2");
  bytes32[] keyTuple2;

  Schema tableSchema;
  Schema tableKeySchema;
  bytes32 tableId;

  function setUp() public {
    tableSchema = SchemaLib.encode(SchemaType.UINT256);
    tableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;
    tableId = ResourceSelector.from(namespace, sourceName);
  }

  function _installKeysWithValueModule() internal {
    // Register source table
    tableId = world.registerTable(namespace, sourceName, tableSchema, tableKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    // !gasreport install keys with value module
    world.installRootModule(keysWithValueModule, abi.encode(tableId));
  }

  function testInstall() public {
    _installKeysWithValueModule();
    // Set a value in the source table
    uint256 value = 1;

    // !gasreport set a record on a table with KeysWithValueModule installed
    world.setRecord(namespace, sourceName, keyTuple1, abi.encodePacked(value));

    // Get the list of entities with this value from the target table
    bytes32[][] memory keysWithValue = getKeysWithValue(world, tableId, abi.encode(value));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0][0], key1);
  }

  function testSetAndDeleteRecordHook() public {
    _installKeysWithValueModule();

    // Set a value in the source table
    uint256 value1 = 1;

    world.setRecord(namespace, sourceName, keyTuple1, abi.encodePacked(value1));

    // Get the list of entities with value1 from the target table
    bytes32[][] memory keysWithValue = getKeysWithValue(world, tableId, abi.encode(value1));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "1");
    assertEq(keysWithValue[0][0], key1, "2");

    // Set a another key with the same value
    world.setRecord(namespace, sourceName, keyTuple2, abi.encodePacked(value1));

    // Get the list of entities with value2 from the target table
    keysWithValue = getKeysWithValue(world, tableId, abi.encode(value1));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 2);
    assertEq(keysWithValue[0][0], key1, "3");
    assertEq(keysWithValue[1][0], key2, "4");

    // Change the value of the first key
    uint256 value2 = 2;

    // !gasreport change a record on a table with KeysWithValueModule installed
    world.setRecord(namespace, sourceName, keyTuple1, abi.encodePacked(value2));

    // Get the list of entities with value1 from the target table
    keysWithValue = getKeysWithValue(world, tableId, abi.encode(value1));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "5");
    assertEq(keysWithValue[0][0], key2, "6");

    // Get the list of entities with value2 from the target table
    keysWithValue = getKeysWithValue(world, tableId, abi.encode(value2));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "7");
    assertEq(keysWithValue[0][0], key1, "8");

    // Delete the first key
    // !gasreport delete a record on a table with KeysWithValueModule installed
    world.deleteRecord(namespace, sourceName, keyTuple1);

    // Get the list of entities with value2 from the target table
    keysWithValue = getKeysWithValue(world, tableId, abi.encode(value2));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 0, "9");
  }

  function testSetField() public {
    _installKeysWithValueModule();

    // Set a value in the source table
    uint256 value1 = 1;

    // !gasreport set a field on a table with KeysWithValueModule installed
    world.setField(namespace, sourceName, keyTuple1, 0, abi.encodePacked(value1));

    // Get the list of entities with value1 from the target table
    bytes32[][] memory keysWithValue = getKeysWithValue(world, tableId, abi.encode(value1));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0][0], key1);

    uint256 value2 = 2;

    // Change the value using setField
    // !gasreport change a field on a table with KeysWithValueModule installed
    world.setField(namespace, sourceName, keyTuple1, 0, abi.encodePacked(value2));

    // Get the list of entities with value1 from the target table
    keysWithValue = getKeysWithValue(world, tableId, abi.encode(value1));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 0);

    // Get the list of entities with value2 from the target table
    keysWithValue = getKeysWithValue(world, tableId, abi.encode(value2));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0][0], key1);
  }

  function testGetKeysWithValue() public {
    _installKeysWithValueModule();

    // Set a value in the source table
    uint256 value1 = 1;

    world.setRecord(namespace, sourceName, keyTuple1, abi.encodePacked(value1));

    // !gasreport Get list of keys with a given value
    bytes32[][] memory keysWithValue = getKeysWithValue(world, tableId, abi.encode(value1));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0][0], key1);

    // Set a another key with the same value
    world.setRecord(namespace, sourceName, keyTuple2, abi.encodePacked(value1));

    // Get the list of keys with value1 from the target table
    keysWithValue = getKeysWithValue(world, tableId, abi.encode(value1));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 2);
    assertEq(keysWithValue[0][0], key1);
    assertEq(keysWithValue[1][0], key2);
  }
}
