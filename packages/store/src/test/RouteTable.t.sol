// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { RouteTable, tableId as RouteTableId, Route } from "../tables/RouteTable.sol";
import { StoreCore } from "../StoreCore.sol";
import { SchemaType } from "../Types.sol";
import { StoreView } from "../StoreView.sol";
import { Schema } from "../Schema.sol";

contract RouteTableTest is DSTestPlus, StoreView {
  function testRegisterAndGetSchema() public {
    // !gasreport register RouteTable schema
    RouteTable.registerSchema();

    Schema registeredSchema = StoreCore.getSchema(RouteTableId);
    Schema declaredSchema = RouteTable.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    RouteTable.registerSchema();
    bytes32 key = keccak256("somekey");

    address addr = address(0x1234);
    bytes4 selector = bytes4(0x12345678);
    uint8 executionMode = 1;

    // !gasreport set RouteTable record
    RouteTable.set(key, addr, selector, executionMode);

    // !gasreport get RouteTable record
    Route memory systemEntry = RouteTable.get(key);

    assertEq(systemEntry.addr, addr);
    assertEq(systemEntry.selector, selector);
    assertEq(systemEntry.executionMode, executionMode);
  }
}
