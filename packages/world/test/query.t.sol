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
  bytes16 name1 = bytes16("source1");
  bytes16 name2 = bytes16("source2");
  bytes16 name3 = bytes16("source3");

  Schema tableSchema;
  Schema tableKeySchema;
  bytes32 table1 = ResourceSelector.from(namespace, name1);
  bytes32 table2 = ResourceSelector.from(namespace, name2);
  bytes32 table3 = ResourceSelector.from(namespace, name3);

  uint256 value = 1;
  bytes32[] key1 = new bytes32[](1);
  bytes32[] key2 = new bytes32[](1);
  bytes32[] key3 = new bytes32[](1);
  bytes32[] key4 = new bytes32[](1);
  QueryFragment[] fragmentsHasHas;
  QueryFragment[] fragmentsHasNot;

  function setUp() public {
    tableSchema = SchemaLib.encode(SchemaType.UINT256);
    tableKeySchema = SchemaLib.encode(SchemaType.BYTES32);
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));

    key1[0] = "test1";
    key2[0] = "test2";
    key3[0] = "test3";
    key4[0] = "test4";

    fragmentsHasHas.push(QueryFragment(QueryType.Has, table1, ""));
    fragmentsHasHas.push(QueryFragment(QueryType.Has, table2, ""));
    fragmentsHasNot.push(QueryFragment(QueryType.Has, table1, ""));
    fragmentsHasNot.push(QueryFragment(QueryType.Not, table2, ""));
  }

  function _installKeysInTableModule() internal {
    // Register source table
    table1 = world.registerTable(namespace, name1, tableSchema, tableKeySchema);
    table2 = world.registerTable(namespace, name2, tableSchema, tableKeySchema);
    table3 = world.registerTable(namespace, name3, tableSchema, tableKeySchema);

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    world.installRootModule(keysInTableModule, abi.encode(table1));
    world.installRootModule(keysInTableModule, abi.encode(table2));
    world.installRootModule(keysInTableModule, abi.encode(table3));
  }

  function _installKeysWithValueModule() internal {
    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    world.installRootModule(keysWithValueModule, abi.encode(table1));
    world.installRootModule(keysWithValueModule, abi.encode(table2));
    world.installRootModule(keysWithValueModule, abi.encode(table3));
  }

  function testHasQuery() public {
    _installKeysInTableModule();

    world.setRecord(namespace, name1, key1, abi.encode(1));
    world.setRecord(namespace, name1, key2, abi.encode(1));
    world.setRecord(namespace, name2, key1, abi.encode(0));

    // Query should return all keys in table1
    QueryFragment[] memory fragments = new QueryFragment[](1);
    // The value argument is ignored in for Has query fragments
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    // !gasreport HasQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key1[0]);
    assertTrue(keyTuples[1][0] == key2[0]);
  }

  function testHasValueQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, name1, key1, abi.encode(2));
    world.setRecord(namespace, name1, key2, abi.encode(1));
    world.setRecord(namespace, name1, key3, abi.encode(1));
    // Query should return all keys in table1 with value 1
    QueryFragment[] memory fragments = new QueryFragment[](1);
    fragments[0] = QueryFragment(QueryType.HasValue, table1, abi.encode(1));
    // !gasreport HasValueQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key2[0]);
    assertTrue(keyTuples[1][0] == key3[0]);
  }

  function testCombinedHasQuery() public {
    _installKeysInTableModule();

    world.setRecord(namespace, name1, key1, abi.encode(2));
    world.setRecord(namespace, name1, key2, abi.encode(1));
    world.setRecord(namespace, name1, key3, abi.encode(1));
    world.setRecord(namespace, name2, key2, abi.encode(1));
    world.setRecord(namespace, name2, key3, abi.encode(1));
    world.setRecord(namespace, name3, key1, abi.encode(1));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.Has, table2, new bytes(0));
    // !gasreport CombinedHasQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key2[0]);
    assertTrue(keyTuples[1][0] == key3[0]);
  }

  function testCombinedHasValueQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, name1, key1, abi.encode(2));
    world.setRecord(namespace, name1, key2, abi.encode(2));
    world.setRecord(namespace, name1, key3, abi.encode(1));
    world.setRecord(namespace, name2, key2, abi.encode(1));
    world.setRecord(namespace, name2, key3, abi.encode(1));
    world.setRecord(namespace, name3, key1, abi.encode(1));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.HasValue, table1, abi.encode(1));
    fragments[1] = QueryFragment(QueryType.HasValue, table2, abi.encode(1));
    // !gasreport CombinedHasValueQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 1);
    assertTrue(keyTuples[0][0] == key3[0]);
  }

  function testCombinedHasHasValueQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, name1, key1, abi.encode(1));
    world.setRecord(namespace, name1, key2, abi.encode(1));
    world.setRecord(namespace, name1, key3, abi.encode(1));
    world.setRecord(namespace, name2, key1, abi.encode(1));
    world.setRecord(namespace, name2, key2, abi.encode(2));
    world.setRecord(namespace, name2, key3, abi.encode(2));
    world.setRecord(namespace, name2, key4, abi.encode(2));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.HasValue, table2, abi.encode(2));
    // !gasreport CombinedHasHasValueQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key2[0]);
    assertTrue(keyTuples[1][0] == key3[0]);
  }

  function testCombinedHasNotQuery() public {
    _installKeysInTableModule();

    world.setRecord(namespace, name1, key1, abi.encode(1));
    world.setRecord(namespace, name1, key2, abi.encode(1));
    world.setRecord(namespace, name1, key3, abi.encode(1));
    world.setRecord(namespace, name2, key1, abi.encode(1));
    world.setRecord(namespace, name2, key2, abi.encode(2));
    world.setRecord(namespace, name2, key3, abi.encode(2));
    world.setRecord(namespace, name2, key4, abi.encode(2));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, table2, new bytes(0));
    fragments[1] = QueryFragment(QueryType.Not, table1, new bytes(0));
    // !gasreport CombinedHasNotQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 1);
    assertTrue(keyTuples[0][0] == key4[0]);
  }

  function testCombinedHasValueNotQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, name1, key1, abi.encode(1));
    world.setRecord(namespace, name1, key2, abi.encode(1));
    world.setRecord(namespace, name1, key3, abi.encode(1));
    world.setRecord(namespace, name2, key1, abi.encode(1));
    world.setRecord(namespace, name2, key2, abi.encode(2));
    world.setRecord(namespace, name2, key3, abi.encode(1));
    world.setRecord(namespace, name2, key4, abi.encode(1));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.HasValue, table2, abi.encode(1));
    fragments[1] = QueryFragment(QueryType.Not, table1, new bytes(0));
    // !gasreport CombinedHasValueNotQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 1);
    assertTrue(keyTuples[0][0] == key4[0]);
  }

  function testCombinedHasHasValueNotQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, name1, key1, abi.encode(1));
    world.setRecord(namespace, name1, key2, abi.encode(1));
    world.setRecord(namespace, name1, key3, abi.encode(1));
    world.setRecord(namespace, name2, key1, abi.encode(1));
    world.setRecord(namespace, name2, key2, abi.encode(2));
    world.setRecord(namespace, name2, key3, abi.encode(1));
    world.setRecord(namespace, name2, key4, abi.encode(1));
    world.setRecord(namespace, name3, key2, abi.encode(1));
    world.setRecord(namespace, name3, key3, abi.encode(1));
    world.setRecord(namespace, name3, key4, abi.encode(1));

    // Query should return all entities that have table2 and not table1
    QueryFragment[] memory fragments = new QueryFragment[](3);
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.HasValue, table2, abi.encode(1));
    fragments[2] = QueryFragment(QueryType.Not, table3, new bytes(0));
    // !gasreport CombinedHasHasValueNotQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 1);
    assertTrue(keyTuples[0][0] == key1[0]);
  }

  function testNotValueQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(namespace, name1, key1, abi.encode(4));
    world.setRecord(namespace, name1, key2, abi.encode(5));
    world.setRecord(namespace, name1, key3, abi.encode(6));

    // Query should return all entities with table1 except value 6
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.NotValue, table1, abi.encode(6));
    // !gasreport NotValueQuery
    bytes32[][] memory keyTuples = query(world, fragments);

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key1[0]);
    assertTrue(keyTuples[1][0] == key2[0]);
  }
}
