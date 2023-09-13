// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Vector2, Vector2Data, Vector2TableId } from "../src/codegen/Tables.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";

contract Vector2Test is Test, GasReporter, StoreReadWithStubs {
  function testRegisterAndGetFieldLayout() public {
    startGasReport("register Vector2 field layout");
    Vector2.register();
    endGasReport();

    FieldLayout registeredFieldLayout = StoreCore.getFieldLayout(Vector2TableId);
    FieldLayout declaredFieldLayout = Vector2.getFieldLayout();

    assertEq(FieldLayout.unwrap(registeredFieldLayout), FieldLayout.unwrap(declaredFieldLayout));
  }

  function testRegisterAndGetSchema() public {
    Vector2.register();

    Schema registeredSchema = StoreCore.getValueSchema(Vector2TableId);
    Schema declaredSchema = Vector2.getValueSchema();

    assertEq(Schema.unwrap(registeredSchema), Schema.unwrap(declaredSchema));
  }

  function testSetAndGet() public {
    Vector2.register();
    bytes32 key = keccak256("somekey");

    startGasReport("set Vector2 record");
    Vector2.set({ key: key, x: 1, y: 2 });
    endGasReport();

    startGasReport("get Vector2 record");
    Vector2Data memory vector = Vector2.get(key);
    endGasReport();

    assertEq(vector.x, 1);
    assertEq(vector.y, 2);
  }
}
