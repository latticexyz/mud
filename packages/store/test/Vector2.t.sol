// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema, SchemaLib, SchemaType } from "../src/Schema.sol";

import { Vector2, Vector2Data } from "./codegen/index.sol";

contract Vector2Test is Test, GasReporter, StoreMock {
  function testRegisterAndGetFieldLayout() public {
    startGasReport("register Vector2 field layout");
    Vector2.register();
    endGasReport();

    FieldLayout registeredFieldLayout = StoreCore.getFieldLayout(Vector2._tableId);
    FieldLayout declaredFieldLayout = Vector2._fieldLayout;

    assertEq(FieldLayout.unwrap(registeredFieldLayout), FieldLayout.unwrap(declaredFieldLayout));
  }

  function testRegisterAndGetSchema() public {
    Vector2.register();

    Schema registeredSchema = StoreCore.getValueSchema(Vector2._tableId);
    Schema declaredSchema = Vector2._valueSchema;

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

  function testKeySchemaEncoding() public {
    SchemaType[] memory _keySchema = new SchemaType[](1);
    _keySchema[0] = SchemaType.BYTES32;

    assertEq(Schema.unwrap(SchemaLib.encode(_keySchema)), Schema.unwrap(Vector2._keySchema));
  }

  function testValueSchemaEncoding() public {
    SchemaType[] memory _valueSchema = new SchemaType[](2);
    _valueSchema[0] = SchemaType.UINT32;
    _valueSchema[1] = SchemaType.UINT32;

    assertEq(Schema.unwrap(SchemaLib.encode(_valueSchema)), Schema.unwrap(Vector2._valueSchema));
  }
}
