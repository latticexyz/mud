// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { SystemTable, id as SystemTableId, Schema as SystemEntry } from "../tables/SystemTable.sol";
import { StoreCore } from "../StoreCore.sol";
import { SchemaType } from "../Types.sol";
import { StoreView } from "../StoreView.sol";

contract SystemTableTest is DSTestPlus, StoreView {
  function testRegisterAndGetSchema() public {
    uint256 gas = gasleft();
    SystemTable.registerSchema();
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    SchemaType[] memory registeredSchema = StoreCore.getSchema(SystemTableId);
    SchemaType[] memory declaredSchema = SystemTable.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    SystemTable.registerSchema();
    bytes32 key = keccak256("somekey");

    address addr = address(0x1234);
    bytes4 selector = bytes4(0x12345678);
    uint8 executionMode = 1;

    uint256 gas = gasleft();
    SystemTable.set(key, addr, selector, executionMode);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    gas = gasleft();
    SystemEntry memory systemEntry = SystemTable.get(key);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    assertEq(systemEntry.addr, addr);
    assertEq(systemEntry.selector, selector);
    assertEq(systemEntry.executionMode, executionMode);
  }
}
