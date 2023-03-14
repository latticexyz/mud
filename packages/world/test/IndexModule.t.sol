// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { World } from "../src/World.sol";
import { IWorld } from "../src/interfaces/IWorld.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";
import { ROOT_NAMESPACE } from "../src/constants.sol";

import { RegistrationModule } from "../src/modules/registration/RegistrationModule.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { IndexModule } from "../src/modules/index/IndexModule.sol";
import { ReverseMapping } from "../src/modules/index/tables/ReverseMapping.sol";

contract IndexModuleTest is Test {
  using ResourceSelector for bytes32;
  IWorld world;
  IndexModule indexModule = new IndexModule(); // Modules can be deployed once and installed multiple times

  bytes16 namespace = ROOT_NAMESPACE;
  bytes16 sourceFile = bytes16("source");
  bytes16 targetFile = bytes16("target");
  bytes32 key1 = keccak256("test");
  bytes32[] keyTuple1;
  bytes32 key2 = keccak256("test2");
  bytes32[] keyTuple2;

  Schema sourceTableSchema;
  Schema sourceTableKeySchema;
  uint256 sourceTableId;
  uint256 targetTableId;

  function setUp() public {
    sourceTableSchema = SchemaLib.encode(SchemaType.UINT256);
    sourceTableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    world.installRootModule(new RegistrationModule(), new bytes(0));
    keyTuple1 = new bytes32[](1);
    keyTuple1[0] = key1;
    keyTuple2 = new bytes32[](1);
    keyTuple2[0] = key2;
  }

  function _installIndexModule() internal {
    targetTableId = ResourceSelector.from(namespace, targetFile).toTableId();

    // Register source table
    sourceTableId = uint256(world.registerTable(namespace, sourceFile, sourceTableSchema, sourceTableKeySchema));

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    world.installRootModule(indexModule, abi.encode(sourceTableId, targetTableId));
  }

  function testInstall() public {
    _installIndexModule();
    // Set a value in the source table
    uint256 value = 1;

    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value));

    // Get the list of entities with this value from the target table
    bytes32[] memory keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0], key1);
  }

  function testSetAndDeleteRecordHook() public {
    _installIndexModule();

    // Set a value in the source table
    uint256 value1 = 1;

    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value1));

    // Get the list of entities with value1 from the target table
    bytes32[] memory keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "1");
    assertEq(keysWithValue[0], key1, "2");

    // Set a another key with the same value
    world.setRecord(namespace, sourceFile, keyTuple2, abi.encodePacked(value1));

    // Get the list of entities with value2 from the target table
    keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 2);
    assertEq(keysWithValue[0], key1, "3");
    assertEq(keysWithValue[1], key2, "4");

    // Change the value of the first key
    uint256 value2 = 2;

    world.setRecord(namespace, sourceFile, keyTuple1, abi.encodePacked(value2));

    // Get the list of entities with value1 from the target table
    keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "5");
    assertEq(keysWithValue[0], key2, "6");

    // Get the list of entities with value2 from the target table
    keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1, "7");
    assertEq(keysWithValue[0], key1, "8");

    // Delete the first key
    world.deleteRecord(namespace, sourceFile, keyTuple1);

    // Get the list of entities with value2 from the target table
    keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 0, "9");
  }

  function testSetField() public {
    _installIndexModule();

    // Set a value in the source table
    uint256 value1 = 1;

    world.setField(namespace, sourceFile, keyTuple1, 0, abi.encodePacked(value1));

    // Get the list of entities with value1 from the target table
    bytes32[] memory keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0], key1);

    uint256 value2 = 2;

    // Change the value using setField
    world.setField(namespace, sourceFile, keyTuple1, 0, abi.encodePacked(value2));

    // Get the list of entities with value1 from the target table
    keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value1)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 0);

    // Get the list of entities with value2 from the target table
    keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value2)));

    // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    assertEq(keysWithValue[0], key1);
  }
}
