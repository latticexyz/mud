// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { SchemaEncodeHelper } from "@latticexyz/store/test/SchemaEncodeHelper.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { FieldLayoutEncodeHelper } from "@latticexyz/store/test/FieldLayoutEncodeHelper.sol";

import { World } from "@latticexyz/world/src/World.sol";
import { IModule } from "@latticexyz/world/src/IModule.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldResourceIdLib, WorldResourceIdInstance, NAME_BITS, TYPE_BITS } from "@latticexyz/world/src/WorldResourceId.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { RESOURCE_TABLE } from "@latticexyz/world/src/worldResourceTypes.sol";

import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { KeysWithValueModule } from "../src/modules/keyswithvalue/KeysWithValueModule.sol";
import { MODULE_NAMESPACE } from "../src/modules/keyswithvalue/constants.sol";
import { KeysWithValue } from "../src/modules/keyswithvalue/tables/KeysWithValue.sol";
import { getKeysWithValue } from "../src/modules/keyswithvalue/getKeysWithValue.sol";
import { getTargetTableId, MODULE_NAMESPACE_BITS, TABLE_NAMESPACE_BITS } from "../src/modules/keyswithvalue/getTargetTableId.sol";

contract KeysWithValueModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld world;
  KeysWithValueModule private keysWithValueModule = new KeysWithValueModule(); // Modules can be deployed once and installed multiple times

  bytes14 private namespace = ROOT_NAMESPACE;
  bytes16 private sourceName = bytes16("source");
  bytes32 private key1 = keccak256("test");
  bytes32[] private keyTuple1;
  bytes32 private key2 = keccak256("test2");
  bytes32[] private keyTuple2;

  FieldLayout private sourceTableFieldLayout;
  Schema private sourceTableSchema;
  Schema private sourceTableKeySchema;
  ResourceId private sourceTableId;
  ResourceId private targetTableId;

  function setUp() public {
    sourceTableFieldLayout = FieldLayoutEncodeHelper.encode(32, 0);
    sourceTableSchema = SchemaEncodeHelper.encode(SchemaType.UINT256);
    sourceTableKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);
    sourceTableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: sourceName });
    targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);

    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
    StoreSwitch.setStoreAddress(address(world));

    keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;
  }

  function _installKeysWithValueModule() internal {
    // Register source table
    world.registerTable(
      sourceTableId,
      sourceTableFieldLayout,
      sourceTableKeySchema,
      sourceTableSchema,
      new string[](1),
      new string[](1)
    );

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    startGasReport("install keys with value module");
    world.installRootModule(keysWithValueModule, abi.encode(sourceTableId));
    endGasReport();
  }

  function testMatchingByteSizes() public {
    assertEq(MODULE_NAMESPACE_BITS + TABLE_NAMESPACE_BITS + NAME_BITS + TYPE_BITS, 256);
  }

  function testInstall() public {
    _installKeysWithValueModule();
    // Set a value in the source table
    uint256 value = 1;

    startGasReport("set a record on a table with KeysWithValueModule installed");
    world.setRecord(sourceTableId, keyTuple1, abi.encodePacked(value), PackedCounter.wrap(bytes32(0)), new bytes(0));
    endGasReport();

    // Get the list of entities with this value from the target table
    bytes32[] memory keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encodePacked(value)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0], key1);
  }

  function testInstallTwice() public {
    world.installRootModule(keysWithValueModule, abi.encode(sourceTableId));
    vm.expectRevert(IModule.Module_AlreadyInstalled.selector);
    world.installRootModule(keysWithValueModule, abi.encode(sourceTableId));
  }

  function testSetAndDeleteRecordHook() public {
    _installKeysWithValueModule();

    // Set a value in the source table
    uint256 value1 = 1;

    world.setRecord(sourceTableId, keyTuple1, abi.encodePacked(value1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Get the list of entities with value1 from the target table
    bytes32[] memory keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encodePacked(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "1");
    assertEq(keysWithValue[0], key1, "2");

    // Set a another key with the same value
    world.setRecord(sourceTableId, keyTuple2, abi.encodePacked(value1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encodePacked(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 2);
    assertEq(keysWithValue[0], key1, "3");
    assertEq(keysWithValue[1], key2, "4");

    // Change the value of the first key
    uint256 value2 = 2;

    startGasReport("change a record on a table with KeysWithValueModule installed");
    world.setRecord(sourceTableId, keyTuple1, abi.encodePacked(value2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    endGasReport();

    // Get the list of entities with value1 from the target table
    keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encodePacked(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "5");
    assertEq(keysWithValue[0], key2, "6");

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encodePacked(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "7");
    assertEq(keysWithValue[0], key1, "8");

    // Delete the first key
    startGasReport("delete a record on a table with KeysWithValueModule installed");
    world.deleteRecord(sourceTableId, keyTuple1);
    endGasReport();

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encodePacked(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 0, "9");
  }

  function testSetField() public {
    _installKeysWithValueModule();

    // Set a value in the source table
    uint256 value1 = 1;

    startGasReport("set a field on a table with KeysWithValueModule installed");
    world.setField(sourceTableId, keyTuple1, 0, abi.encodePacked(value1), sourceTableFieldLayout);
    endGasReport();

    // Get the list of entities with value1 from the target table
    bytes32[] memory keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0], key1);

    uint256 value2 = 2;

    // Change the value using setField
    startGasReport("change a field on a table with KeysWithValueModule installed");
    world.setField(sourceTableId, keyTuple1, 0, abi.encodePacked(value2), sourceTableFieldLayout);
    endGasReport();

    // Get the list of entities with value1 from the target table
    keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 0);

    // Get the list of entities with value2 from the target table
    keysWithValue = KeysWithValue.get(targetTableId, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0], key1);
  }

  function testGetTargetTableId() public {
    startGasReport("compute the target table selector");
    ResourceId _targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);
    endGasReport();

    // The first 2 bytes are the resource type
    assertEq(_targetTableId.getType(), RESOURCE_TABLE, "target table resource type does not match");

    // The next 7 bytes are the module namespace
    assertEq(
      bytes7(ResourceId.unwrap(_targetTableId) << (TYPE_BITS)),
      MODULE_NAMESPACE,
      "module namespace does not match"
    );

    // followed by the first 7 bytes of the source table namespace
    assertEq(
      bytes7(ResourceId.unwrap(_targetTableId) << (TYPE_BITS + MODULE_NAMESPACE_BITS)),
      bytes7(namespace),
      "table namespace does not match"
    );

    // The last 16 bytes are the source name
    assertEq(_targetTableId.getName(), sourceName, "table name does not match");
  }

  function testGetKeysWithValueGas() public {
    // call fuzzed test manually to get gas report
    testGetKeysWithValue(1);
  }

  function testGetKeysWithValue(uint256 value) public {
    _installKeysWithValueModule();

    // Set a value in the source table
    world.setRecord(sourceTableId, keyTuple1, abi.encodePacked(value), PackedCounter.wrap(bytes32(0)), new bytes(0));

    startGasReport("Get list of keys with a given value");
    bytes32[] memory keysWithValue = getKeysWithValue(
      world,
      sourceTableId,
      abi.encodePacked(value),
      PackedCounter.wrap(bytes32(0)),
      new bytes(0)
    );
    endGasReport();

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0], key1);

    // Set a another key with the same value
    world.setRecord(sourceTableId, keyTuple2, abi.encodePacked(value), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Get the list of keys with value from the target table
    keysWithValue = getKeysWithValue(
      world,
      sourceTableId,
      abi.encodePacked(value),
      PackedCounter.wrap(bytes32(0)),
      new bytes(0)
    );

    // Assert that the list is correct
    assertEq(keysWithValue.length, 2);
    assertEq(keysWithValue[0], key1);
    assertEq(keysWithValue[1], key2);
  }
}
