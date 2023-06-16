// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { KeyEncoding, KeyEncodingTableId } from "../src/codegen/Tables.sol";
import { ExampleEnum } from "../src/codegen/Types.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { Schema } from "../src/Schema.sol";

contract KeyEncodingTest is Test, StoreReadWithStubs {
  function testRegisterAndGetSchema() public {
    // !gasreport register KeyEncoding schema
    KeyEncoding.registerSchema();

    Schema registeredSchema = StoreCore.getSchema(KeyEncodingTableId);
    Schema declaredSchema = KeyEncoding.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    KeyEncoding.registerSchema();

    // !gasreport set KeyEncoding record
    KeyEncoding.set(
      42,
      -42,
      bytes16(hex"1234"),
      0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF,
      true,
      ExampleEnum.Third,
      true
    );

    // !gasreport get KeyEncoding record
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
    KeyEncoding.registerSchema();

    // !gasreport encode KeyEncoding key tuple
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
}
