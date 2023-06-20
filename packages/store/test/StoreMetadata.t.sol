// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/std-contracts/src/test/GasReporter.sol";
import { StoreMetadata, StoreMetadataData } from "../src/codegen/Tables.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { Schema } from "../src/Schema.sol";

contract StoreMetadataTest is Test, GasReporter, StoreReadWithStubs {
  function testSetAndGet() public {
    bytes32 tableId = "1";
    string memory tableName = "firstTable";
    string[] memory valueSchemaNames = new string[](2);
    valueSchemaNames[0] = "firstField";
    valueSchemaNames[1] = "secondField";
    string[] memory keySchemaNames = new string[](2);
    keySchemaNames[0] = "firstKey";
    keySchemaNames[1] = "secondKey";

    startGasReport("set record in StoreMetadataTable");
    StoreMetadata.set({
      tableId: tableId,
      tableName: tableName,
      abiEncodedValueSchemaNames: abi.encode(valueSchemaNames),
      abiEncodedKeySchemaNames: abi.encode(keySchemaNames)
    });
    endGasReport();

    startGasReport("get record from StoreMetadataTable");
    StoreMetadataData memory metadata = StoreMetadata.get(tableId);
    endGasReport();

    assertEq(metadata.tableName, tableName);
    assertEq(metadata.abiEncodedValueSchemaNames, abi.encode(valueSchemaNames));
    assertEq(metadata.abiEncodedKeySchemaNames, abi.encode(keySchemaNames));
  }
}
