// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { World } from "../src/World.sol";
import { Customer } from "./tables/Customer.sol";
import { IWorld } from "../src/modules/query/world/IWorld.sol";
import { QuerySystem } from "../src/modules/query/systems/QuerySystem.sol";
import { SelectionFragment, SelectionType, Record } from "../src/modules/query/systems/structs.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { KeysInTableModule } from "../src/modules/keysintable/KeysInTableModule.sol";

function isEqual(bytes memory a, bytes memory b) pure returns (bool) {
  return keccak256(a) == keccak256(b);
}

function isEqual(string memory a, string memory b) pure returns (bool) {
  return keccak256(abi.encode(a)) == keccak256(abi.encode(b));
}

contract SqlTest is Test {
  address worldAddress;
  IWorld public world;

  Schema defaultKeySchema = SchemaLib.encode(SchemaType.BYTES32);
  bytes32 tableId;

  QuerySystem private immutable querySystem = new QuerySystem();
  KeysInTableModule keysInTableModule = new KeysInTableModule();

  function setUp() public {
    worldAddress = address(new World());
    world = IWorld(worldAddress);
    world.installRootModule(new CoreModule(), new bytes(0));

    bytes16 namespace = "query";
    bytes16 name = "table";
    bytes16 systemName = "system";

    tableId = world.registerTable(namespace, name, Customer.getSchema(), defaultKeySchema);
    world.registerSystem(namespace, systemName, querySystem, true);
    // Register system's functions
    world.registerFunctionSelector(namespace, systemName, "query", "(address,bytes32,uint8[],(uint8,uint8,bytes)[])");

    world.installRootModule(keysInTableModule, abi.encode(tableId));
  }

  function testQuery(bytes32 key, uint32 value, string memory name) public {
    vm.assume(bytes(name).length > 0);

    vm.prank(worldAddress);
    Customer.set(world, tableId, key, value, name);
    uint32 balance = Customer.getBalance(world, tableId, key);
    assertEq(balance, value);

    uint8[] memory projectionFieldIndices = new uint8[](2);
    projectionFieldIndices[0] = 0;
    projectionFieldIndices[1] = 1;
    SelectionFragment[] memory fragments = new SelectionFragment[](0);

    Record[] memory records = world.query_system_query(world, tableId, projectionFieldIndices, fragments);

    assertEq(records.length, 1);
    assertTrue(isEqual(records[0].value[0], abi.encodePacked(value)));
    assertTrue(isEqual(records[0].value[1], abi.encodePacked(name)));
  }

  function filter(
    SelectionType selectionType,
    uint8 fieldIndex,
    bytes memory value,
    bytes memory result0,
    bytes memory result1
  ) internal {
    uint8[] memory projectionFieldIndices = new uint8[](2);
    projectionFieldIndices[0] = 0;
    projectionFieldIndices[1] = 1;

    SelectionFragment[] memory fragments = new SelectionFragment[](1);
    fragments[0] = SelectionFragment(selectionType, fieldIndex, value);

    Record[] memory records = world.query_system_query(world, tableId, projectionFieldIndices, fragments);

    assertEq(records.length, 1);
    assertTrue(isEqual(records[0].value[0], result0));
    assertTrue(isEqual(records[0].value[1], result1));
  }

  function testQuerySelection(
    bytes32 key1,
    bytes32 key2,
    uint32 value1,
    uint32 value2,
    string memory name1,
    string memory name2
  ) public {
    vm.assume(key1 != key2);
    vm.assume(value1 != value2);
    vm.assume(!isEqual(name1, name2));
    vm.assume(bytes(name1).length > 0);
    vm.assume(bytes(name2).length > 0);

    vm.startPrank(worldAddress);
    Customer.set(world, tableId, key1, value1, name1);
    Customer.set(world, tableId, key2, value2, name2);
    vm.stopPrank();

    assertEq(Customer.getBalance(world, tableId, key1), value1);
    assertEq(Customer.getBalance(world, tableId, key2), value2);

    uint8[] memory projectionFieldIndices = new uint8[](2);
    projectionFieldIndices[0] = 0;
    projectionFieldIndices[1] = 1;
    SelectionFragment[] memory fragments = new SelectionFragment[](0);

    Record[] memory records = world.query_system_query(world, tableId, projectionFieldIndices, fragments);

    assertEq(records.length, 2);

    // FILTER BY BALANCE
    filter(SelectionType.Equal, 0, abi.encodePacked(value1), abi.encodePacked(value1), abi.encodePacked(name1));
    filter(SelectionType.Equal, 0, abi.encodePacked(value2), abi.encodePacked(value2), abi.encodePacked(name2));
    filter(SelectionType.NotEqual, 0, abi.encodePacked(value1), abi.encodePacked(value2), abi.encodePacked(name2));
    filter(SelectionType.NotEqual, 0, abi.encodePacked(value2), abi.encodePacked(value1), abi.encodePacked(name1));

    // FILTER BY NAME
    filter(SelectionType.Equal, 1, abi.encodePacked(name1), abi.encodePacked(value1), abi.encodePacked(name1));
    filter(SelectionType.Equal, 1, abi.encodePacked(name2), abi.encodePacked(value2), abi.encodePacked(name2));
    filter(SelectionType.NotEqual, 1, abi.encodePacked(name1), abi.encodePacked(value2), abi.encodePacked(name2));
    filter(SelectionType.NotEqual, 1, abi.encodePacked(name2), abi.encodePacked(value1), abi.encodePacked(name1));
  }
}
