// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { RouteTable, id as RouteTableId, Route } from "../tables/RouteTable.sol";
import { StoreCore } from "../StoreCore.sol";
import { SchemaType } from "../Types.sol";
import { StoreView } from "../StoreView.sol";

contract RouteTableTest is DSTestPlus, StoreView {
  function testRegisterAndGetSchema() public {
    uint256 gas = gasleft();
    RouteTable.registerSchema();
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    bytes32 registeredSchema = StoreCore.getSchema(RouteTableId);
    bytes32 declaredSchema = RouteTable.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    RouteTable.registerSchema();
    bytes32 key = keccak256("somekey");

    address addr = address(0x1234);
    bytes4 selector = bytes4(0x12345678);
    uint8 executionMode = 1;

    uint256 gas = gasleft();
    RouteTable.set(key, addr, selector, executionMode);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    gas = gasleft();
    Route memory systemEntry = RouteTable.get(key);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    assertEq(systemEntry.addr, addr);
    assertEq(systemEntry.selector, selector);
    assertEq(systemEntry.executionMode, executionMode);
  }
}
