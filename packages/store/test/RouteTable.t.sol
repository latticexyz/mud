// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { RouteTable, RouteTableId, Route } from "../src/tables/Route.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { SchemaType } from "../src/Types.sol";
import { StoreView } from "../src/StoreView.sol";
import { Schema } from "../src/Schema.sol";

contract RouteTableTest is Test, StoreView {
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
