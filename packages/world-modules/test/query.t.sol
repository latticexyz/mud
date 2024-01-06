// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { FieldLayoutEncodeHelper } from "@latticexyz/store/test/FieldLayoutEncodeHelper.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { SchemaEncodeHelper } from "@latticexyz/store/test/SchemaEncodeHelper.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { World } from "@latticexyz/world/src/World.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { RESOURCE_TABLE } from "@latticexyz/world/src/worldResourceTypes.sol";

import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { CoreModule2 } from "@latticexyz/world/src/modules/core/CoreModule2.sol";
import { KeysInTableModule } from "../src/modules/keysintable/KeysInTableModule.sol";
import { KeysWithValueModule } from "../src/modules/keyswithvalue/KeysWithValueModule.sol";
import { query, QueryFragment, QueryType } from "../src/modules/keysintable/query.sol";

contract QueryTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;
  IBaseWorld private world;
  KeysInTableModule private keysInTableModule = new KeysInTableModule(); // Modules can be deployed once and installed multiple times
  KeysWithValueModule private keysWithValueModule = new KeysWithValueModule();

  bytes14 private namespace = ROOT_NAMESPACE;
  bytes16 private name1 = bytes16("source1");
  bytes16 private name2 = bytes16("source2");
  bytes16 private name3 = bytes16("source3");

  FieldLayout private tableFieldLayout;
  Schema private tableKeySchema;
  Schema private tableValueSchema;
  ResourceId private table1 = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name1 });
  ResourceId private table2 = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name2 });
  ResourceId private table3 = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name3 });

  uint256 private value = 1;
  bytes32[] private key1 = new bytes32[](1);
  bytes32[] private key2 = new bytes32[](1);
  bytes32[] private key3 = new bytes32[](1);
  bytes32[] private key4 = new bytes32[](1);
  QueryFragment[] private fragmentsHasHas;
  QueryFragment[] private fragmentsHasNot;

  function setUp() public {
    tableFieldLayout = FieldLayoutEncodeHelper.encode(32, 0);
    tableKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);
    tableValueSchema = SchemaEncodeHelper.encode(SchemaType.UINT256);
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule(), new CoreModule2());

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
    world.registerTable(table1, tableFieldLayout, tableKeySchema, tableValueSchema, new string[](1), new string[](1));
    world.registerTable(table2, tableFieldLayout, tableKeySchema, tableValueSchema, new string[](1), new string[](1));
    world.registerTable(table3, tableFieldLayout, tableKeySchema, tableValueSchema, new string[](1), new string[](1));

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

    world.setRecord(table1, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key1, abi.encode(0), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all keys in table1
    QueryFragment[] memory fragments = new QueryFragment[](1);
    // The value argument is ignored in for Has query fragments
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    startGasReport("HasQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key1[0]);
    assertTrue(keyTuples[1][0] == key2[0]);
  }

  function testHasValueQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(table1, key1, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    // Query should return all keys in table1 with value 1
    QueryFragment[] memory fragments = new QueryFragment[](1);
    fragments[0] = QueryFragment(QueryType.HasValue, table1, abi.encode(1));
    startGasReport("HasValueQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key2[0]);
    assertTrue(keyTuples[1][0] == key3[0]);
  }

  function testCombinedHasQuery() public {
    _installKeysInTableModule();

    world.setRecord(table1, key1, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table3, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.Has, table2, new bytes(0));
    startGasReport("CombinedHasQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key2[0]);
    assertTrue(keyTuples[1][0] == key3[0]);
  }

  function testCombinedHasValueQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(table1, key1, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table3, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.HasValue, table1, abi.encode(1));
    fragments[1] = QueryFragment(QueryType.HasValue, table2, abi.encode(1));
    startGasReport("CombinedHasValueQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 1);
    assertTrue(keyTuples[0][0] == key3[0]);
  }

  function testCombinedHasHasValueQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(table1, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key2, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key3, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key4, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.HasValue, table2, abi.encode(2));
    startGasReport("CombinedHasHasValueQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key2[0]);
    assertTrue(keyTuples[1][0] == key3[0]);
  }

  function testCombinedHasNotQuery() public {
    _installKeysInTableModule();

    world.setRecord(table1, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key2, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key3, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key4, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, table2, new bytes(0));
    fragments[1] = QueryFragment(QueryType.Not, table1, new bytes(0));
    startGasReport("CombinedHasNotQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 1);
    assertTrue(keyTuples[0][0] == key4[0]);
  }

  function testCombinedHasValueNotQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(table1, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key2, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key4, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all entities that have table1 and table2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.HasValue, table2, abi.encode(1));
    fragments[1] = QueryFragment(QueryType.Not, table1, new bytes(0));
    startGasReport("CombinedHasValueNotQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 1);
    assertTrue(keyTuples[0][0] == key4[0]);
  }

  function testCombinedHasHasValueNotQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(table1, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key1, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key2, abi.encode(2), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table2, key4, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table3, key2, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table3, key3, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table3, key4, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all entities that have table2 and not table1
    QueryFragment[] memory fragments = new QueryFragment[](3);
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.HasValue, table2, abi.encode(1));
    fragments[2] = QueryFragment(QueryType.Not, table3, new bytes(0));
    startGasReport("CombinedHasHasValueNotQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 1);
    assertTrue(keyTuples[0][0] == key1[0]);
  }

  function testNotValueQuery() public {
    _installKeysInTableModule();
    _installKeysWithValueModule();

    world.setRecord(table1, key1, abi.encode(4), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key2, abi.encode(5), PackedCounter.wrap(bytes32(0)), new bytes(0));
    world.setRecord(table1, key3, abi.encode(6), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all entities with table1 except value 6
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.NotValue, table1, abi.encode(6));
    startGasReport("NotValueQuery");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 2);
    assertTrue(keyTuples[0][0] == key1[0]);
    assertTrue(keyTuples[1][0] == key2[0]);
  }

  function testHasQuery100Keys() public {
    _installKeysInTableModule();

    for (uint256 i; i < 100; i++) {
      bytes32[] memory keyTuple = new bytes32[](1);
      keyTuple[0] = bytes32(i);
      world.setRecord(table1, keyTuple, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    }
    world.setRecord(table2, key1, abi.encode(0), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all keys in table1
    QueryFragment[] memory fragments = new QueryFragment[](1);
    // The value argument is ignored in for Has query fragments
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    startGasReport("HasQuery with 100 keys");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 100);
  }

  function testHasQuery1000Keys() public {
    _installKeysInTableModule();

    for (uint256 i; i < 1000; i++) {
      bytes32[] memory keyTuple = new bytes32[](1);
      keyTuple[0] = bytes32(i);
      world.setRecord(table1, keyTuple, abi.encode(1), PackedCounter.wrap(bytes32(0)), new bytes(0));
    }
    world.setRecord(table2, key1, abi.encode(0), PackedCounter.wrap(bytes32(0)), new bytes(0));

    // Query should return all keys in table1
    QueryFragment[] memory fragments = new QueryFragment[](1);
    // The value argument is ignored in for Has query fragments
    fragments[0] = QueryFragment(QueryType.Has, table1, new bytes(0));
    startGasReport("HasQuery with 1000 keys");
    bytes32[][] memory keyTuples = query(world, fragments);
    endGasReport();

    assertTrue(keyTuples.length == 1000);
  }
}
