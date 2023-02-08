// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import { StoreView } from "../src/StoreView.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";
import { SchemaType } from "../src/Types.sol";

contract Store is StoreView {
  function registerSchema(bytes32 table, Schema schema) public override {
    StoreCore.registerSchema(table, schema);
  }

  function setRecord(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) public override {
    StoreCore.setRecord(table, key, data);
  }

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) public override {
    StoreCore.setField(table, key, schemaIndex, data);
  }
}

contract StoreScript is Script {
  function run() public {
    vm.startBroadcast();

    uint256 blockNumber = block.number;

    // Deploy a new store
    Store store = new Store();

    // Register a table in the store
    Schema schema = SchemaLib.encode(SchemaType.Uint32, SchemaType.Uint128);
    bytes32 table = keccak256("test/tableid");
    store.registerSchema(table, schema);

    // Set a value in the table
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("test/key");
    bytes memory value = abi.encodePacked(uint32(42), uint128(1337));
    store.setRecord(table, key, value);

    // Update the field at schema index 1
    store.setField(table, key, 1, abi.encodePacked(uint128(31337)));

    console.log("Store deployed at address %s at block %s", address(store), blockNumber);
  }
}
