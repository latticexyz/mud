// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Bytes } from "../Bytes.sol";

contract BytesTest is DSTestPlus {
  function testFromBytesArray() public {
    bytes[] memory input = new bytes[](2);
    input[0] = new bytes(32);
    input[0][0] = 0x01;
    input[0][31] = 0x02;
    input[1] = new bytes(32);
    input[1][0] = 0x03;
    input[1][31] = 0x04;
    uint256 gas = gasleft();
    bytes memory output = Bytes.from(input);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
    assertEq(output.length, 64);
    assertEq(uint256(Bytes.toBytes32(output, 0)), 0x0100000000000000000000000000000000000000000000000000000000000002);
    assertEq(uint256(Bytes.toBytes32(output, 32)), 0x0300000000000000000000000000000000000000000000000000000000000004);
  }

  function testFromUint8Array() public {
    uint8[] memory input = new uint8[](2);
    input[0] = 0x01;
    input[1] = 0x02;
    uint256 gas = gasleft();
    bytes memory output = Bytes.from(input);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
    assertEq(output.length, 2);
    assertEq(uint256(uint8(output[0])), 0x01);
    assertEq(uint256(uint8(output[1])), 0x02);
  }

  function testToBytes32() public {
    bytes memory input = new bytes(32);
    input[0] = 0x01;
    input[31] = 0x02;
    uint256 gas = gasleft();
    bytes32 output = Bytes.toBytes32(input, 0);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
    assertEq(uint256(output), 0x0100000000000000000000000000000000000000000000000000000000000002);
  }

  function testToBytes32CrossWord() public {
    bytes memory input = new bytes(64);
    input[0 + 16] = 0x01;
    input[31 + 16] = 0x02;
    uint256 gas = gasleft();
    bytes32 output = Bytes.toBytes32(input, 16);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
    assertEq(uint256(output), 0x0100000000000000000000000000000000000000000000000000000000000002);
  }

  function testToBytesArray() public {
    bytes memory input = new bytes(64);
    input[0] = 0x01;
    input[31] = 0x02;
    input[32] = 0x03;
    input[63] = 0x04;
    uint256 gas = gasleft();
    bytes32[] memory output = Bytes.toBytes32Array(input);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
    assertEq(output.length, 2);
    assertEq(uint256(output[0]), 0x0100000000000000000000000000000000000000000000000000000000000002);
    assertEq(uint256(output[1]), 0x0300000000000000000000000000000000000000000000000000000000000004);
  }

  function testToBytesArrayUneven() public {
    bytes memory input = new bytes(65);
    input[0] = 0x01;
    input[31] = 0x02;
    input[32] = 0x03;
    input[63] = 0x04;
    input[64] = 0x05;
    uint256 gas = gasleft();
    bytes32[] memory output = Bytes.toBytes32Array(input);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
    assertEq(output.length, 3);
    assertEq(uint256(output[0]), 0x0100000000000000000000000000000000000000000000000000000000000002);
    assertEq(uint256(output[1]), 0x0300000000000000000000000000000000000000000000000000000000000004);
    assertEq(uint256(output[2]), 0x0500000000000000000000000000000000000000000000000000000000000000);
  }

  function testEquals() public {
    bytes memory a = bytes("a");
    bytes memory b = bytes("a");
    uint256 gas = gasleft();
    assertTrue(Bytes.equals(a, b));
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
  }

  function testEqualsFalse() public {
    bytes memory a = bytes("a");
    bytes memory b = bytes("b");
    uint256 gas = gasleft();
    assertFalse(Bytes.equals(a, b));
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
  }

  function testEqualsFalseDiffLength() public {
    bytes memory a = bytes("a");
    bytes memory b = bytes("aa");
    uint256 gas = gasleft();
    assertFalse(Bytes.equals(a, b));
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
  }

  function testSetLengthInPlace() public {
    bytes memory a = new bytes(5);
    assertEq(a.length, 5);

    uint256 gas = gasleft();
    Bytes.setLengthInPlace(a, 2);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(a.length, 2);
  }
}
