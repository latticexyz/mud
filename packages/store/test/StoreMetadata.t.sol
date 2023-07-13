// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreMetadata, StoreMetadataData } from "../src/codegen/Tables.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { Schema } from "../src/Schema.sol";

contract StoreMetadataTest is Test, GasReporter, StoreReadWithStubs {
  function testSetAndGet() public {
    bytes32 tableId = "1";
    string memory tableName = "firstTable";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "firstField";
    fieldNames[1] = "secondField";

    startGasReport("set record in StoreMetadataTable");
    StoreMetadata.set({ tableId: tableId, tableName: tableName, abiEncodedFieldNames: abi.encode(fieldNames) });
    endGasReport();

    startGasReport("get record from StoreMetadataTable");
    StoreMetadataData memory metadata = StoreMetadata.get(tableId);
    endGasReport();

    assertEq(metadata.tableName, tableName);
    assertEq(metadata.abiEncodedFieldNames, abi.encode(fieldNames));
  }
}
