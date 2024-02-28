// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema, SchemaLib, SchemaType } from "../src/Schema.sol";

import { StoreMock } from "./StoreMock.sol";
import { KeyEncoding } from "./codegen/index.sol";
import { ExampleEnum } from "./codegen/common.sol";

contract KeyEncodingTest is Test, GasReporter, StoreMock {
  function testRegisterAndGetFieldLayout() public {
    startGasReport("register KeyEncoding table");
    KeyEncoding.register();
    endGasReport();

    FieldLayout registeredFieldLayout = StoreCore.getFieldLayout(KeyEncoding._tableId);
    FieldLayout declaredFieldLayout = KeyEncoding._fieldLayout;

    assertEq(keccak256(abi.encode(registeredFieldLayout)), keccak256(abi.encode(declaredFieldLayout)));
  }

  function testRegisterAndGetSchema() public {
    KeyEncoding.register();

    Schema registeredSchema = StoreCore.getValueSchema(KeyEncoding._tableId);
    Schema declaredSchema = KeyEncoding._valueSchema;

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    KeyEncoding.register();

    KeyEncoding.set(
      42,
      -42,
      bytes16(hex"1234"),
      0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF,
      true,
      ExampleEnum.Third,
      true
    );

    bool value = KeyEncoding.get(
      42,
      -42,
      bytes16(hex"1234"),
      0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF,
      true,
      ExampleEnum.Third
    );

    assertEq(value, true);
  }

  function testKeyEncoding() public {
    KeyEncoding.register();

    bytes32[] memory keyTuple = KeyEncoding.encodeKeyTuple(
      42,
      -42,
      bytes16(hex"1234"),
      0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF,
      true,
      ExampleEnum.Third
    );

    assertEq(keyTuple.length, 6);

    // assert that the key tuple is encoded how we expect
    assertEq(keyTuple[0], bytes32(hex"000000000000000000000000000000000000000000000000000000000000002a"));
    assertEq(keyTuple[1], bytes32(hex"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6"));
    assertEq(keyTuple[2], bytes32(hex"1234000000000000000000000000000000000000000000000000000000000000"));
    assertEq(keyTuple[3], bytes32(hex"000000000000000000000000ffffffffffffffffffffffffffffffffffffffff"));
    assertEq(keyTuple[4], bytes32(hex"0000000000000000000000000000000000000000000000000000000000000001"));
    assertEq(keyTuple[5], bytes32(hex"0000000000000000000000000000000000000000000000000000000000000003"));

    // assert that the key tuple encoding matches abi.encode (our implementation is more gas efficient)
    assertEq(keyTuple[0], bytes32(abi.encode(42)));
    assertEq(keyTuple[1], bytes32(abi.encode(-42)));
    assertEq(keyTuple[2], bytes32(abi.encode(bytes16(hex"1234"))));
    assertEq(keyTuple[3], bytes32(abi.encode(0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF)));
    assertEq(keyTuple[4], bytes32(abi.encode(true)));
    assertEq(keyTuple[5], bytes32(abi.encode(ExampleEnum.Third)));
  }

  function testKeySchemaEncoding() public {
    SchemaType[] memory _keySchema = new SchemaType[](6);
    _keySchema[0] = SchemaType.UINT256;
    _keySchema[1] = SchemaType.INT32;
    _keySchema[2] = SchemaType.BYTES16;
    _keySchema[3] = SchemaType.ADDRESS;
    _keySchema[4] = SchemaType.BOOL;
    _keySchema[5] = SchemaType.UINT8;

    assertEq(Schema.unwrap(SchemaLib.encode(_keySchema)), Schema.unwrap(KeyEncoding._keySchema));
  }

  function testValueSchemaEncoding() public {
    SchemaType[] memory _valueSchema = new SchemaType[](1);
    _valueSchema[0] = SchemaType.BOOL;

    assertEq(Schema.unwrap(SchemaLib.encode(_valueSchema)), Schema.unwrap(KeyEncoding._valueSchema));
  }
}
