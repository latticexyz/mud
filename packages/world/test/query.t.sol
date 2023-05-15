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
import { KeysWithValueModule } from "../src/modules/keyswithvalue/KeysWithValueModule.sol";
import { intersection, intersectionBare, QueryFragment, QueryType } from "../src/modules/keysintable/query.sol";

contract queryTest is Test {
  using ResourceSelector for bytes32;
  IBaseWorld world;
  KeysInTableModule keysInTableModule = new KeysInTableModule(); // Modules can be deployed once and installed multiple times
  KeysWithValueModule keysWithValueModule = new KeysWithValueModule();

  bytes16 namespace = ROOT_NAMESPACE;
  bytes16 nameA = bytes16("sourceA");
  bytes16 nameB = bytes16("sourceB");

  Schema tableSchema;
  Schema tableKeySchema;
  bytes32 tableA = ResourceSelector.from(namespace, nameA);
  bytes32 tableB = ResourceSelector.from(namespace, nameB);

  bytes32[][] keys = new bytes32[][](2);

  QueryFragment[] fragmentsHasNot;
  QueryFragment[] fragmentsHasHas;

  function setUp() public {
    tableSchema = SchemaLib.encode(SchemaType.UINT256);
    tableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));

    keys[0] = new bytes32[](1);
    keys[1] = new bytes32[](1);
    keys[0][0] = "test1";
    keys[1][0] = "test2";

    fragmentsHasNot.push(QueryFragment(QueryType.Has, tableA, ""));
    fragmentsHasNot.push(QueryFragment(QueryType.Not, tableB, ""));
    fragmentsHasHas.push(QueryFragment(QueryType.Has, tableA, ""));
    fragmentsHasHas.push(QueryFragment(QueryType.Has, tableB, ""));
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

  function _installKeysWithValueModule() internal {
    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    // !gasreport install keys in table module
    world.installRootModule(keysWithValueModule, abi.encode(tableA));
    world.installRootModule(keysWithValueModule, abi.encode(tableB));
  }

  function testIntersectionOneTable(uint256 value) public {
    _installKeysInTableModule();

    // Set a value in the source table
    world.setRecord(namespace, nameA, keys[0], abi.encodePacked(value));

    QueryFragment[] memory fragments = new QueryFragment[](1);
    fragments[0] = QueryFragment(QueryType.Has, tableA, "");

    bytes32[][] memory keyTuples = intersection(world, fragments);

    // Assert that the list includes all the keys in the table
    assertEq(keyTuples.length, 1);
    for (uint256 i; i < 1; i++) {
      assertEq(keyTuples[i][0], keys[i][0]);
    }

    // Set another key with a different value
    world.setRecord(namespace, nameA, keys[1], abi.encodePacked(value));

    // Get the list of keys in the target table
    keyTuples = intersection(world, fragments);

    // Assert that the list includes all the keys in the table
    assertEq(keyTuples.length, 2);
    for (uint256 i; i < 2; i++) {
      assertEq(keyTuples[i][0], keys[i][0]);
    }
  }

  function testIntersectionTwoTables21(uint256 value) public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, nameA, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameA, keys[1], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[0], abi.encodePacked(value));

    bytes32[][] memory keyTuples1 = intersection(world, fragmentsHasNot);
    bytes32[][] memory keyTuples2 = intersection(world, fragmentsHasHas);
    bytes32[][] memory keyTuplesBare1 = intersectionBare(world, fragmentsHasNot);
    bytes32[][] memory keyTuplesBare2 = intersectionBare(world, fragmentsHasHas);

    // Assert that the list is the intersection of both tables keys
    assertEq(keyTuples1.length, 1);
    assertEq(keyTuples1[0][0], keys[1][0]);
    assertEq(keyTuples2.length, 1);
    assertEq(keyTuples2[0][0], keys[0][0]);

    assertEq(keyTuplesBare1.length, 1);
    assertEq(keyTuplesBare1[0][0], keys[1][0]);
    assertEq(keyTuplesBare2.length, 1);
    assertEq(keyTuplesBare2[0][0], keys[0][0]);
  }

  function testIntersectionTwoTables12(uint256 value) public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, nameA, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[1], abi.encodePacked(value));

    bytes32[][] memory keyTuples1 = intersection(world, fragmentsHasNot);
    bytes32[][] memory keyTuples2 = intersection(world, fragmentsHasHas);
    bytes32[][] memory keyTuplesBare1 = intersectionBare(world, fragmentsHasNot);
    bytes32[][] memory keyTuplesBare2 = intersectionBare(world, fragmentsHasHas);

    // Assert that the list is the intersection of both tables keys
    assertEq(keyTuples1.length, 0);
    assertEq(keyTuples2.length, 1);
    assertEq(keyTuples2[0][0], keys[0][0]);

    assertEq(keyTuplesBare1.length, 0);
    assertEq(keyTuplesBare2.length, 1);
    assertEq(keyTuplesBare2[0][0], keys[0][0]);
  }

  function testIntersectionTwoTables22(uint256 value) public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    // Set both keys in both tables
    world.setRecord(namespace, nameA, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameA, keys[1], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[1], abi.encodePacked(value));

    bytes32[][] memory keyTuples1 = intersection(world, fragmentsHasNot);
    bytes32[][] memory keyTuples2 = intersection(world, fragmentsHasHas);
    bytes32[][] memory keyTuplesBare1 = intersectionBare(world, fragmentsHasNot);
    bytes32[][] memory keyTuplesBare2 = intersectionBare(world, fragmentsHasHas);

    // Assert that the list is the intersection of both tables keys
    assertEq(keyTuples1.length, 0);
    assertEq(keyTuples2.length, 2);
    assertEq(keyTuples2[0][0], keys[0][0]);
    assertEq(keyTuples2[1][0], keys[1][0]);

    assertEq(keyTuplesBare1.length, 0);
    assertEq(keyTuplesBare2.length, 2);
    assertEq(keyTuplesBare2[0][0], keys[0][0]);
    assertEq(keyTuplesBare2[1][0], keys[1][0]);
  }

  function testIntersectionHasValue(uint256 value) public {
    vm.assume(value != 0);

    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, nameA, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[1], abi.encodePacked(value));

    QueryFragment[] memory fragmentsHasHasvalue = new QueryFragment[](2);
    QueryFragment[] memory fragmentsHasNotvalue = new QueryFragment[](2);
    fragmentsHasHasvalue[0] = QueryFragment(QueryType.Has, tableA, "");
    fragmentsHasHasvalue[1] = QueryFragment(QueryType.HasValue, tableB, abi.encodePacked(value));
    fragmentsHasNotvalue[0] = QueryFragment(QueryType.Has, tableA, "");
    fragmentsHasNotvalue[1] = QueryFragment(QueryType.NotValue, tableB, abi.encodePacked(value));

    bytes32[][] memory keyTuplesBare1 = intersectionBare(world, fragmentsHasNot);
    bytes32[][] memory keyTuplesBare2 = intersectionBare(world, fragmentsHasHas);
    bytes32[][] memory keyTuplesBare3 = intersectionBare(world, fragmentsHasHasvalue);
    bytes32[][] memory keyTuplesBare4 = intersectionBare(world, fragmentsHasNotvalue);

    // Assert that the list is the intersection of both tables keys
    assertEq(keyTuplesBare1.length, 0);
    assertEq(keyTuplesBare2.length, 1);
    assertEq(keyTuplesBare2[0][0], keys[0][0]);

    assertEq(keyTuplesBare3.length, 1);
    assertEq(keyTuplesBare3[0][0], keys[0][0]);

    assertEq(keyTuplesBare4.length, 0);
  }
}
