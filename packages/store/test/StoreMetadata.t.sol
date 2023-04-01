// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreMetadata, StoreMetadataData } from "../src/tables/StoreMetadata.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreView } from "../src/StoreView.sol";
import { Schema } from "../src/Schema.sol";

contract StoreMetadataTest is Test, StoreView {
  function testSetAndGet() public {
    uint256 tableId = 1;
    string memory tableName = "firstTable";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "firstField";
    fieldNames[1] = "secondField";

    // !gasreport set record in StoreMetadataTable
    StoreMetadata.set({ tableId: tableId, tableName: tableName, abiEncodedFieldNames: abi.encode(fieldNames) });

    // !gasreport get record from StoreMetadataTable
    StoreMetadataData memory metadata = StoreMetadata.get(tableId);

    assertEq(metadata.tableName, tableName);
    assertEq(metadata.abiEncodedFieldNames, abi.encode(fieldNames));
  }
}
