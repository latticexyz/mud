// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreMetadataTable, StoreMetadata } from "../src/tables/StoreMetadataTable.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { SchemaType } from "../src/Types.sol";
import { StoreView } from "../src/StoreView.sol";
import { Schema } from "../src/Schema.sol";

contract StoreMetadataTableTest is Test, StoreView {
  function testSetAndGet() public {
    uint256 tableId = 1;
    string memory tableName = "firstTable";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "firstField";
    fieldNames[1] = "secondField";

    // !gasreport set record in StoreMetadataTable
    StoreMetadataTable.set({ tableId: tableId, tableName: tableName, fieldNames: fieldNames });

    // !gasreport get record from StoreMetadataTable
    StoreMetadata memory metadata = StoreMetadataTable.get(tableId);

    assertEq(metadata.tableName, tableName);
    assertEq(metadata.abiEncodedFieldNames, abi.encode(fieldNames));
  }
}
