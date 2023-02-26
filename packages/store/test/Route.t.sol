// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { Route, RouteData, RouteTableId } from "../src/tables/Route.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { SchemaType } from "../src/Types.sol";
import { StoreView } from "../src/StoreView.sol";
import { Schema } from "../src/Schema.sol";

contract RouteTest is Test, StoreView {
  function testRegisterAndGetSchema() public {
    // !gasreport register Route schema
    Route.registerSchema();

    Schema registeredSchema = StoreCore.getSchema(RouteTableId);
    Schema declaredSchema = Route.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    Route.registerSchema();
    bytes32 key = keccak256("somekey");

    address addr = address(0x1234);
    bytes4 selector = bytes4(0x12345678);
    uint8 executionMode = 1;

    // !gasreport set Route record
    Route.set(key, addr, selector, executionMode);

    // !gasreport get Route record
    RouteData memory systemEntry = Route.get(key);

    assertEq(systemEntry.addr, addr);
    assertEq(systemEntry.selector, selector);
    assertEq(systemEntry.executionMode, executionMode);
  }
}
