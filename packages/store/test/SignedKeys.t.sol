// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SignedKeys, SignedKeysTableId } from "../src/codegen/Tables.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { Schema } from "../src/Schema.sol";

contract SignedKeysTest is Test, StoreReadWithStubs {
  function testRegisterAndGetSchema() public {
    // !gasreport register SignedKeys schema
    SignedKeys.registerSchema();

    Schema registeredSchema = StoreCore.getSchema(SignedKeysTableId);
    Schema declaredSchema = SignedKeys.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    SignedKeys.registerSchema();

    // !gasreport set SignedKeys record
    SignedKeys.set({ x: -1, y: -2, value: true });

    // !gasreport get SignedKeys record
    bool value = SignedKeys.get({ x: -1, y: -2 });

    assertEq(value, true);
  }

  function testKeyEncoding() public {
    SignedKeys.registerSchema();

    // !gasreport encode SignedKeys key tuple
    bytes32[] memory keyTuple = SignedKeys.encodeKeyTuple({ x: -1, y: -2 });

    assertEq(keyTuple.length, 2);
    assertEq(keyTuple[0], bytes32(hex"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
    assertEq(keyTuple[1], bytes32(hex"fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe"));
  }
}
