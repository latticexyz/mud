// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vector2Table, tableId as Vector2Id, Vector2 } from "../tables/Vector2Table.sol";
import { StoreCore } from "../StoreCore.sol";
import { SchemaType } from "../Types.sol";
import { StoreView } from "../StoreView.sol";
import { Schema } from "../Schema.sol";

contract Vector2TableTest is DSTestPlus, StoreView {
  function testRegisterAndGetSchema() public {
    // !gasreport register Vector2Table schema
    Vector2Table.registerSchema();

    Schema registeredSchema = StoreCore.getSchema(Vector2Id);
    Schema declaredSchema = Vector2Table.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    Vector2Table.registerSchema();
    bytes32 key = keccak256("somekey");

    // !gasreport set Vector2Table record
    Vector2Table.set({ key: key, x: 1, y: 2 });

    // !gasreport get Vector2Table record
    Vector2 memory vector = Vector2Table.get(key);

    assertEq(vector.x, 1);
    assertEq(vector.y, 2);
  }
}
