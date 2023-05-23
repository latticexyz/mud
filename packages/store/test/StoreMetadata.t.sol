// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreMetadata, StoreMetadataData } from "../src/codegen/Tables.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { Schema } from "../src/Schema.sol";

contract StoreMetadataTest is Test, StoreReadWithStubs {
  function testSetAndGet() public {
    bytes32 tableId = "1";
    string memory tableName = "firstTable";
    string[] memory keyNames = new string[](1);
    keyNames[0] = "firstKey";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "firstField";
    fieldNames[1] = "secondField";

    StoreMetadataData memory metadata = StoreMetadataData(tableName, abi.encode(keyNames), abi.encode(fieldNames));

    // !gasreport set record in StoreMetadataTable
    StoreMetadata.set(tableId, metadata);

    // !gasreport get record from StoreMetadataTable
    metadata = StoreMetadata.get(tableId);

    assertEq(metadata.tableName, tableName);
    assertEq(metadata.abiEncodedFieldNames, abi.encode(fieldNames));
  }
}
