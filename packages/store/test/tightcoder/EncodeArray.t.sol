// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { Bytes } from "../../src/Bytes.sol";
import { EncodeArray } from "../../src/tightcoder/EncodeArray.sol";

contract EncodeArrayTest is Test {
  function testEncodeBytesArray() public {
    bytes[] memory input = new bytes[](2);
    input[0] = new bytes(32);
    input[0][0] = 0x01;
    input[0][31] = 0x02;
    input[1] = new bytes(32);
    input[1][0] = 0x03;
    input[1][31] = 0x04;

    // !gasreport encode packed bytes[]
    bytes memory output = EncodeArray.encode(input);

    assertEq(output.length, 64);
    assertEq(uint256(Bytes.toBytes32(output, 0)), 0x0100000000000000000000000000000000000000000000000000000000000002);
    assertEq(uint256(Bytes.toBytes32(output, 32)), 0x0300000000000000000000000000000000000000000000000000000000000004);
  }

  function testEncodeUint8Array() public {
    uint8[] memory input = new uint8[](2);
    input[0] = 0x01;
    input[1] = 0x02;

    // !gasreport encode packed uint8[]
    bytes memory output = EncodeArray.encode(input);

    assertEq(output.length, 2);
    assertEq(uint256(uint8(output[0])), 0x01);
    assertEq(uint256(uint8(output[1])), 0x02);
  }

  function testEncodeUint16Array() public {
    uint16[] memory input = new uint16[](3);
    input[0] = 0x0102;
    input[1] = 0x0304;
    input[2] = 0x0506;

    // !gasreport encode packed uint16[]
    bytes memory output = EncodeArray.encode(input);

    assertEq(output.length, 6);
    assertEq(uint256(uint8(output[0])), 0x01);
    assertEq(uint256(uint8(output[1])), 0x02);
    assertEq(uint256(uint8(output[2])), 0x03);
    assertEq(uint256(uint8(output[3])), 0x04);
    assertEq(uint256(uint8(output[4])), 0x05);
    assertEq(uint256(uint8(output[5])), 0x06);
  }

  function testEncodeUint32Array() public {
    uint32[] memory input = new uint32[](2);
    input[0] = 0x01020304;
    input[1] = 0x05060708;

    // !gasreport encode packed uint32[]
    bytes memory output = EncodeArray.encode(input);

    assertEq(output.length, 8);
    assertEq(uint256(uint8(output[0])), 0x01);
    assertEq(uint256(uint8(output[1])), 0x02);
    assertEq(uint256(uint8(output[2])), 0x03);
    assertEq(uint256(uint8(output[3])), 0x04);
    assertEq(uint256(uint8(output[4])), 0x05);
    assertEq(uint256(uint8(output[5])), 0x06);
    assertEq(uint256(uint8(output[6])), 0x07);
    assertEq(uint256(uint8(output[7])), 0x08);
  }
}
