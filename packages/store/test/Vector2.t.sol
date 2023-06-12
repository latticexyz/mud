// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { Vector2, Vector2Data, Vector2TableId } from "../src/codegen/Tables.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { Schema } from "../src/Schema.sol";

contract Vector2Test is Test, StoreReadWithStubs {
  function testRegisterAndGetSchema() public {
    // !gasreport register Vector2 schema
    Vector2.registerSchema();

    Schema registeredSchema = StoreCore.getSchema(Vector2TableId);
    Schema declaredSchema = Vector2.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    Vector2.registerSchema();
    bytes32 key = keccak256("somekey");

    // !gasreport set Vector2 record
    Vector2.set({ key: key, x: 1, y: 2 });

    // !gasreport get Vector2 record
    Vector2Data memory vector = Vector2.get(key);

    assertEq(vector.x, 1);
    assertEq(vector.y, 2);
  }
}
