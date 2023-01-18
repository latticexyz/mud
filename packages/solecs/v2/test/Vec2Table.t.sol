// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vec2Table, id as Vec2Id, Schema as Vec2 } from "../tables/Vec2Table.sol";
import { StoreCore } from "../StoreCore.sol";
import { SchemaType } from "../Types.sol";
import { StoreView } from "../StoreView.sol";

contract Vec2TableTest is DSTestPlus, StoreView {
  function testRegisterAndGetSchema() public {
    uint256 gas = gasleft();
    Vec2Table.registerSchema();
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    SchemaType[] memory registeredSchema = StoreCore.getSchema(Vec2Id);
    SchemaType[] memory declaredSchema = Vec2Table.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    Vec2Table.registerSchema();
    bytes32 key = keccak256("somekey");

    uint256 gas = gasleft();
    Vec2Table.set({ key: key, x: 1, y: 2 });
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    gas = gasleft();
    Vec2 memory vec2 = Vec2Table.get(key);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    assertEq(vec2.x, 1);
    assertEq(vec2.y, 2);
  }
}
