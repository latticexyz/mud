// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema, SchemaLib, SchemaType } from "../src/Schema.sol";
import { EncodedLengths } from "../src/EncodedLengths.sol";

import { Mixed, MixedData } from "./codegen/index.sol";

contract MixedTest is Test, GasReporter, StoreMock {
  MixedData private testMixed;

  function setUp() public {
    Mixed._register();

    bytes32 key = keccak256("defaultkey");
    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "Lorem ipsum dolor sit amet";
    Mixed.set({ key: key, u32: 1, u128: 2, a32: a32, s: s });
  }

  function testRegisterAndGetFieldLayout() public {
    FieldLayout registeredFieldLayout = StoreCore.getFieldLayout(Mixed._tableId);
    FieldLayout declaredFieldLayout = Mixed._fieldLayout;

    assertEq(keccak256(abi.encode(registeredFieldLayout)), keccak256(abi.encode(declaredFieldLayout)));
  }

  function testRegisterAndGetSchema() public {
    Schema registeredSchema = StoreCore.getValueSchema(Mixed._tableId);
    Schema declaredSchema = Mixed._valueSchema;

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetGetDeleteExternal() public {
    bytes32 key = keccak256("somekey");

    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    startGasReport("set record in Mixed (external, cold)");
    Mixed.set({ key: key, u32: 1, u128: 2, a32: a32, s: s });
    endGasReport();

    startGasReport("get record from Mixed (external, warm)");
    MixedData memory mixed = Mixed.get(key);
    endGasReport();

    assertEq(mixed.u32, 1);
    assertEq(mixed.u128, 2);
    assertEq(mixed.a32[0], 3);
    assertEq(mixed.a32[1], 4);
    assertEq(mixed.s, s);

    startGasReport("delete record from Mixed (external, warm)");
    Mixed.deleteRecord(key);
    endGasReport();
  }

  function testSetGetDeleteInternal() public {
    bytes32 key = keccak256("somekey");

    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    startGasReport("set record in Mixed (internal, cold)");
    Mixed._set({ key: key, u32: 1, u128: 2, a32: a32, s: s });
    endGasReport();

    startGasReport("get record from Mixed (internal, warm)");
    MixedData memory mixed = Mixed._get(key);
    endGasReport();

    assertEq(mixed.u32, 1);
    assertEq(mixed.u128, 2);
    assertEq(mixed.a32[0], 3);
    assertEq(mixed.a32[1], 4);
    assertEq(mixed.s, s);

    startGasReport("delete record from Mixed (internal, warm)");
    Mixed._deleteRecord(key);
    endGasReport();
  }

  function testDeleteExternalCold() public {
    bytes32 key = keccak256("defaultkey");

    startGasReport("delete record from Mixed (external, cold)");
    Mixed.deleteRecord(key);
    endGasReport();
  }

  function testDeleteInternalCold() public {
    bytes32 key = keccak256("defaultkey");

    startGasReport("delete record from Mixed (internal, cold)");
    Mixed._deleteRecord(key);
    endGasReport();
  }

  function testCompareSolidity() public {
    MixedData memory mixed = MixedData({ u32: 1, u128: 2, a32: new uint32[](2), s: "some string" });
    mixed.a32[0] = 3;
    mixed.a32[1] = 4;

    startGasReport("store Mixed struct in storage (native solidity)");
    testMixed = mixed;
    endGasReport();
  }

  function testEncode() public {
    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = Mixed.encode(1, 2, a32, s);
    assertEq(staticData, hex"0000000100000000000000000000000000000002");
    assertEq(encodedLengths.unwrap(), hex"000000000000000000000000000000000000000b000000000800000000000013");
    assertEq(dynamicData, hex"0000000300000004736f6d6520737472696e67");
  }

  function testKeySchemaEncoding() public {
    SchemaType[] memory _keySchema = new SchemaType[](1);
    _keySchema[0] = SchemaType.BYTES32;

    assertEq(Schema.unwrap(SchemaLib.encode(_keySchema)), Schema.unwrap(Mixed._keySchema));
  }

  function testValueSchemaEncoding() public {
    SchemaType[] memory _valueSchema = new SchemaType[](4);
    _valueSchema[0] = SchemaType.UINT32;
    _valueSchema[1] = SchemaType.UINT128;
    _valueSchema[2] = SchemaType.UINT32_ARRAY;
    _valueSchema[3] = SchemaType.STRING;

    assertEq(Schema.unwrap(SchemaLib.encode(_valueSchema)), Schema.unwrap(Mixed._valueSchema));
  }
}
