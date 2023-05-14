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
import { intersection, union } from "../src/modules/keysintable/query.sol";

contract queryTest is Test {
  using ResourceSelector for bytes32;
  IBaseWorld world;
  KeysInTableModule keysInTableModule = new KeysInTableModule(); // Modules can be deployed once and installed multiple times

  bytes16 namespace = ROOT_NAMESPACE;
  bytes16 nameA = bytes16("sourceA");
  bytes16 nameB = bytes16("sourceB");

  Schema tableSchema;
  Schema tableKeySchema;
  bytes32 tableA = ResourceSelector.from(namespace, nameA);
  bytes32 tableB = ResourceSelector.from(namespace, nameB);

  function setUp() public {
    tableSchema = SchemaLib.encode(SchemaType.UINT256);
    tableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
  }

  function _installKeysInTableModule() internal {
    // Register source table
    tableA = world.registerTable(namespace, nameA, tableSchema, tableKeySchema);
    tableB = world.registerTable(namespace, nameB, tableSchema, tableKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    // !gasreport install keys in table module
    world.installRootModule(keysInTableModule, abi.encode(tableA));
    world.installRootModule(keysInTableModule, abi.encode(tableB));
  }

  function testUnionSingleTable(bytes32[2] memory keys, uint256[2] memory values) public {
    vm.assume(keys[0] != keys[1]);

    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = keys[0];
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = keys[1];

    // Set a value in the source table
    world.setRecord(namespace, nameA, keyTuple1, abi.encodePacked(values[0]));

    bytes32[] memory tableIds = new bytes32[](1);
    tableIds[0] = tableA;

    bytes32[][] memory keyTuples = union(world, tableIds);

    // Assert that the list includes all the keys in the table
    assertEq(keyTuples.length, 1);
    for (uint256 i; i < 1; i++) {
      assertEq(keyTuples[i][0], keys[i]);
    }

    // Set another key with a different value
    world.setRecord(namespace, nameA, keyTuple2, abi.encodePacked(values[1]));

    // Get the list of keys in the target table
    keyTuples = union(world, tableIds);

    // Assert that the list includes all the keys in the table
    assertEq(keyTuples.length, 2);
    for (uint256 i; i < 2; i++) {
      assertEq(keyTuples[i][0], keys[i]);
    }
  }

  function testUnionTwoTables21(bytes32[2] memory keys, uint256[2] memory values) public {
    vm.assume(keys[0] != keys[1]);

    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = keys[0];
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = keys[1];

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = tableA;
    tableIds[1] = tableB;

    world.setRecord(namespace, nameA, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameA, keyTuple2, abi.encodePacked(values[1]));
    world.setRecord(namespace, nameB, keyTuple1, abi.encodePacked(values[0]));

    bytes32[][] memory keyTuples = union(world, tableIds);

    // Assert that the list is the union of both tables keys
    assertEq(keyTuples.length, 2);
    assertEq(keyTuples[0][0], keys[1]);
    assertEq(keyTuples[1][0], keys[0]);
  }

  function testUnionTwoTables12(bytes32[2] memory keys, uint256[2] memory values) public {
    vm.assume(keys[0] != keys[1]);

    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = keys[0];
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = keys[1];

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = tableA;
    tableIds[1] = tableB;

    world.setRecord(namespace, nameA, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameB, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameB, keyTuple2, abi.encodePacked(values[1]));

    bytes32[][] memory keyTuples = union(world, tableIds);

    // Assert that the list is the union of both tables keys
    assertEq(keyTuples.length, 2);
    assertEq(keyTuples[0][0], keys[0]);
    assertEq(keyTuples[1][0], keys[1]);
  }

  function testUnionTwoTables22(bytes32[2] memory keys, uint256[2] memory values) public {
    vm.assume(keys[0] != keys[1]);

    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = keys[0];
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = keys[1];

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = tableA;
    tableIds[1] = tableB;

    // Set both keys in both tables
    world.setRecord(namespace, nameA, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameA, keyTuple2, abi.encodePacked(values[1]));
    world.setRecord(namespace, nameB, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameB, keyTuple2, abi.encodePacked(values[1]));

    bytes32[][] memory keyTuples = union(world, tableIds);

    // Assert that the list is the union of both tables keys
    assertEq(keyTuples.length, 2);
    assertEq(keyTuples[0][0], keys[0]);
    assertEq(keyTuples[1][0], keys[1]);
  }

  function testIntersectionSingleTable(bytes32[2] memory keys, uint256[2] memory values) public {
    vm.assume(keys[0] != keys[1]);

    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = keys[0];
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = keys[1];

    // Set a value in the source table
    world.setRecord(namespace, nameA, keyTuple1, abi.encodePacked(values[0]));

    bytes32[] memory tableIds = new bytes32[](1);
    tableIds[0] = tableA;

    bytes32[][] memory keyTuples = union(world, tableIds);

    // Assert that the list includes all the keys in the table
    assertEq(keyTuples.length, 1);
    for (uint256 i; i < 1; i++) {
      assertEq(keyTuples[i][0], keys[i]);
    }

    // Set another key with a different value
    world.setRecord(namespace, nameA, keyTuple2, abi.encodePacked(values[1]));

    // Get the list of keys in the target table
    keyTuples = intersection(world, tableIds);

    // Assert that the list includes all the keys in the table
    assertEq(keyTuples.length, 2);
    for (uint256 i; i < 2; i++) {
      assertEq(keyTuples[i][0], keys[i]);
    }
  }

  function testIntersectionTwoTables21(bytes32[2] memory keys, uint256[2] memory values) public {
    vm.assume(keys[0] != keys[1]);

    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = keys[0];
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = keys[1];

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = tableA;
    tableIds[1] = tableB;

    world.setRecord(namespace, nameA, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameA, keyTuple2, abi.encodePacked(values[1]));
    world.setRecord(namespace, nameB, keyTuple1, abi.encodePacked(values[0]));

    bytes32[][] memory keyTuples = intersection(world, tableIds);

    // Assert that the list is the intersection of both tables keys
    assertEq(keyTuples.length, 1);
    assertEq(keyTuples[0][0], keys[0]);
  }

  function testIntersectionTwoTables12(bytes32[2] memory keys, uint256[2] memory values) public {
    vm.assume(keys[0] != keys[1]);

    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = keys[0];
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = keys[1];

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = tableA;
    tableIds[1] = tableB;

    world.setRecord(namespace, nameA, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameB, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameB, keyTuple2, abi.encodePacked(values[1]));

    bytes32[][] memory keyTuples = intersection(world, tableIds);

    // Assert that the list is the intersection of both tables keys
    assertEq(keyTuples.length, 1);
    assertEq(keyTuples[0][0], keys[0]);
  }

  function testIntersectionTwoTables22(bytes32[2] memory keys, uint256[2] memory values) public {
    vm.assume(keys[0] != keys[1]);

    _installKeysInTableModule();

    bytes32[] memory keyTuple1 = new bytes32[](1);
    keyTuple1[0] = keys[0];
    bytes32[] memory keyTuple2 = new bytes32[](1);
    keyTuple2[0] = keys[1];

    bytes32[] memory tableIds = new bytes32[](2);
    tableIds[0] = tableA;
    tableIds[1] = tableB;

    // Set both keys in both tables
    world.setRecord(namespace, nameA, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameA, keyTuple2, abi.encodePacked(values[1]));
    world.setRecord(namespace, nameB, keyTuple1, abi.encodePacked(values[0]));
    world.setRecord(namespace, nameB, keyTuple2, abi.encodePacked(values[1]));

    bytes32[][] memory keyTuples = intersection(world, tableIds);

    // Assert that the list is the intersection of both tables keys
    assertEq(keyTuples.length, 2);
    assertEq(keyTuples[0][0], keys[0]);
    assertEq(keyTuples[1][0], keys[1]);
  }
}
