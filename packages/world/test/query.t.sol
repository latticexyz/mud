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
import { query, QueryFragment, QueryType } from "../src/modules/keysintable/query.sol";

contract QueryTest is Test {
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

  uint256 value = 1;
  bytes32[][] keys = new bytes32[][](2);
  QueryFragment[] fragmentsHasHas;
  QueryFragment[] fragmentsHasNot;

  function setUp() public {
    tableSchema = SchemaLib.encode(SchemaType.UINT256);
    tableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));

    keys[0] = new bytes32[](1);
    keys[1] = new bytes32[](1);
    keys[0][0] = "test1";
    keys[1][0] = "test2";

    fragmentsHasHas.push(QueryFragment(QueryType.Has, tableA, ""));
    fragmentsHasHas.push(QueryFragment(QueryType.Has, tableB, ""));
    fragmentsHasNot.push(QueryFragment(QueryType.Has, tableA, ""));
    fragmentsHasNot.push(QueryFragment(QueryType.Not, tableB, ""));
  }

  function _installKeysInTableModule() internal {
    // Register source table
    tableA = world.registerTable(namespace, nameA, tableSchema, tableKeySchema);
    tableB = world.registerTable(namespace, nameB, tableSchema, tableKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    world.installRootModule(keysInTableModule, abi.encode(tableA));
    world.installRootModule(keysInTableModule, abi.encode(tableB));
  }

  function _installKeysWithValueModule() internal {
    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    world.installRootModule(keysWithValueModule, abi.encode(tableA));
    world.installRootModule(keysWithValueModule, abi.encode(tableB));
  }

  function testHas() public {
    _installKeysInTableModule();

    // Add the first key to table A
    world.setRecord(namespace, nameA, keys[0], abi.encodePacked(value));

    QueryFragment[] memory fragments = new QueryFragment[](1);
    fragments[0] = QueryFragment(QueryType.Has, tableA, "");

    // !gasreport running a Has query with one key
    bytes32[][] memory keyTuples = query(world, fragments);

    assertEq(keyTuples.length, 1);
    for (uint256 i; i < 1; i++) {
      assertEq(keyTuples[i][0], keys[i][0]);
    }

    // Add the second key to table A
    world.setRecord(namespace, nameA, keys[1], abi.encodePacked(value));

    // !gasreport running a Has query with two keys
    keyTuples = query(world, fragments);

    assertEq(keyTuples.length, 2);
    for (uint256 i; i < 2; i++) {
      assertEq(keyTuples[i][0], keys[i][0]);
    }

    // Add the first key to table B
    world.setRecord(namespace, nameB, keys[0], abi.encodePacked(value));

    bytes32[][] memory keyTuplesHasHas = query(world, fragmentsHasHas);
    bytes32[][] memory keyTuplesHasNot = query(world, fragmentsHasNot);

    assertEq(keyTuplesHasHas.length, 1);
    assertEq(keyTuplesHasHas[0][0], keys[0][0]);
    assertEq(keyTuplesHasNot.length, 1);
    assertEq(keyTuplesHasNot[0][0], keys[1][0]);

    // Add the second key to table B
    world.setRecord(namespace, nameB, keys[1], abi.encodePacked(value));

    // !gasreport running a Has, Has query with four keys
    keyTuplesHasHas = query(world, fragmentsHasHas);
    // !gasreport running a Has, HasNot query with four keys
    keyTuplesHasNot = query(world, fragmentsHasNot);

    assertEq(keyTuplesHasHas.length, 2);
    for (uint256 i; i < 2; i++) {
      assertEq(keyTuplesHasHas[i][0], keys[i][0]);
    }
    assertEq(keyTuplesHasNot.length, 0);
  }

  function testHasReverseOrder() public {
    _installKeysInTableModule();

    world.setRecord(namespace, nameA, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[1], abi.encodePacked(value));

    bytes32[][] memory keyTuplesHasNot = query(world, fragmentsHasNot);
    bytes32[][] memory keyTuplesHasHas = query(world, fragmentsHasHas);

    assertEq(keyTuplesHasNot.length, 0);
    assertEq(keyTuplesHasHas.length, 1);
    assertEq(keyTuplesHasHas[0][0], keys[0][0]);

    // Insert the second key into table A
    world.setRecord(namespace, nameA, keys[1], abi.encodePacked(value));

    keyTuplesHasNot = query(world, fragmentsHasNot);
    keyTuplesHasHas = query(world, fragmentsHasHas);

    assertEq(keyTuplesHasNot.length, 0);
    assertEq(keyTuplesHasHas.length, 2);
    for (uint256 i; i < 2; i++) {
      assertEq(keyTuplesHasHas[i][0], keys[i][0]);
    }
  }

  function testHasValue() public {
    vm.assume(value != 0);

    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, nameA, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[0], abi.encodePacked(value));
    world.setRecord(namespace, nameB, keys[1], abi.encodePacked(value));

    QueryFragment[] memory fragmentsHasHasvalue = new QueryFragment[](2);
    QueryFragment[] memory fragmentsHasNotvalue = new QueryFragment[](2);
    QueryFragment[] memory fragmentsHasvalueHas = new QueryFragment[](2);
    QueryFragment[] memory fragmentsHasvalueHasValue = new QueryFragment[](2);
    fragmentsHasHasvalue[0] = QueryFragment(QueryType.Has, tableA, "");
    fragmentsHasHasvalue[1] = QueryFragment(QueryType.HasValue, tableB, abi.encodePacked(value));
    fragmentsHasNotvalue[0] = QueryFragment(QueryType.Has, tableA, "");
    fragmentsHasNotvalue[1] = QueryFragment(QueryType.NotValue, tableB, abi.encodePacked(value));
    fragmentsHasvalueHas[0] = QueryFragment(QueryType.HasValue, tableA, abi.encodePacked(value));
    fragmentsHasvalueHas[1] = QueryFragment(QueryType.Has, tableB, "");
    fragmentsHasvalueHasValue[0] = QueryFragment(QueryType.HasValue, tableA, abi.encodePacked(value));
    fragmentsHasvalueHasValue[1] = QueryFragment(QueryType.HasValue, tableB, abi.encodePacked(value));

    // Assert that all the fragments return the correct keys
    bytes32[][] memory keyTuplesHasHas = query(world, fragmentsHasHas);
    assertEq(keyTuplesHasHas.length, 1);
    assertEq(keyTuplesHasHas[0][0], keys[0][0]);
    bytes32[][] memory keyTuplesHasNot = query(world, fragmentsHasNot);
    assertEq(keyTuplesHasNot.length, 0);
    // !gasreport running a Has, HasValue query with four keys
    bytes32[][] memory keyTuplesHasHasValue = query(world, fragmentsHasHasvalue);
    assertEq(keyTuplesHasHasValue.length, 1);
    assertEq(keyTuplesHasHasValue[0][0], keys[0][0]);
    bytes32[][] memory keyTuplesHasNotvalue = query(world, fragmentsHasNotvalue);
    assertEq(keyTuplesHasNotvalue.length, 0);
    bytes32[][] memory keyTuplesHasvalueHas = query(world, fragmentsHasvalueHas);
    assertEq(keyTuplesHasvalueHas.length, 1);
    // !gasreport running a HasValue, HasValue query with four keys
    bytes32[][] memory keyTuplesHasvalueHasvalue = query(world, fragmentsHasvalueHasValue);
    assertEq(keyTuplesHasvalueHasvalue.length, 1);
  }
}
