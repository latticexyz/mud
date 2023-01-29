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

  function testFromUint16Array() public {
    uint16[] memory input = new uint16[](3);
    input[0] = 0x0102;
    input[1] = 0x0304;
    input[2] = 0x0506;
    uint256 gas = gasleft();
    bytes memory output = Bytes.from(input);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
    assertEq(output.length, 6);
    assertEq(uint256(uint8(output[0])), 0x01);
    assertEq(uint256(uint8(output[1])), 0x02);
    assertEq(uint256(uint8(output[2])), 0x03);
    assertEq(uint256(uint8(output[3])), 0x04);
    assertEq(uint256(uint8(output[4])), 0x05);
    assertEq(uint256(uint8(output[5])), 0x06);
  }

  function testFromUint32Array() public {
    uint32[] memory input = new uint32[](2);
    input[0] = 0x01020304;
    input[1] = 0x05060708;
    uint256 gas = gasleft();
    bytes memory output = Bytes.from(input);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
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

  function testToBytes32Array() public {
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

  function testFromAndToUint32Array() public {
    uint32[] memory input = new uint32[](2);
    input[0] = 0x01020304;
    input[1] = 0x05060708;

    bytes memory tight = Bytes.from(input);
    assertEq(tight.length, 8);

    uint32[] memory output = Bytes.toUint32Array(tight);
    assertEq(output.length, 2);
    assertEq(output[0], 0x01020304);
    assertEq(output[1], 0x05060708);
  }

  function testToBytes32ArrayUneven() public {
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

  function testFromAndToUint32() public {
    uint32 input = 0x01000002;

    uint256 gas = gasleft();
    bytes memory output = Bytes.from(input);
    gas = gas - gasleft();
    console.log("gas used (uint32 -> bytes): %s", gas);

    assertEq(output.length, 4);

    gas = gasleft();
    uint32 output2 = Bytes.toUint32(output);
    gas = gas - gasleft();
    console.log("gas used (bytes -> uint32): %s", gas);

    assertEq(output2, input);
  }

  function testFromAndToUint32Fuzzy(uint32 input) public {
    assertEq(Bytes.toUint32(Bytes.from(input)), input);
  }

  function testFromAndToAddress() public {
    address input = address(0x0100000000000000000000000000000000000002);

    uint256 gas = gasleft();
    bytes memory output = Bytes.from(input);
    gas = gas - gasleft();
    console.log("gas used (address -> bytes): %s", gas);

    assertEq(output.length, 20);

    gas = gasleft();
    address output2 = Bytes.toAddress(output);
    gas = gas - gasleft();
    console.log("gas used (bytes -> address): %s", gas);

    assertEq(output2, input);
  }

  function testFromAndToAddressFuzzy(address input) public {
    assertEq(Bytes.toAddress(Bytes.from(input)), input);
  }

  function testFromAndToUint8() public {
    uint8 input = 0x02;

    uint256 gas = gasleft();
    bytes memory output = Bytes.fromUint8(input);
    gas = gas - gasleft();
    console.log("gas used (uint8 -> bytes): %s", gas);

    assertEq(output.length, 1);

    gas = gasleft();
    uint8 output2 = Bytes.toUint8(output);
    gas = gas - gasleft();
    console.log("gas used (bytes -> uint8): %s", gas);

    assertEq(output2, input);
  }

  function testFromAndToUint8Fuzzy(uint8 input) public {
    assertEq(Bytes.toUint8(Bytes.fromUint8(input)), input);
  }

  function testFromAndToBytes4() public {
    bytes4 input = bytes4(0x01000002);

    uint256 gas = gasleft();
    bytes memory output = Bytes.from(input);
    gas = gas - gasleft();
    console.log("gas used (bytes4 -> bytes): %s", gas);

    assertEq(output.length, 4);

    gas = gasleft();
    bytes4 output2 = Bytes.toBytes4(output);
    gas = gas - gasleft();
    console.log("gas used (bytes -> bytes4): %s", gas);

    assertEq(output2, input);
  }

  function testFromAndToBytes4Fuzzy(bytes4 input) public {
    assertEq(Bytes.toBytes4(Bytes.from(input)), input);
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

  function testSlice() public {
    bytes memory a = new bytes(5);
    a[0] = 0x01;
    a[1] = 0x02;
    a[2] = 0x03;
    a[3] = 0x04;
    a[4] = 0x05;

    uint256 gas = gasleft();
    bytes memory b = Bytes.slice(a, 1, 3);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(b.length, 3);
    assertEq(uint256(uint8(b[0])), 0x02);
    assertEq(uint256(uint8(b[1])), 0x03);
    assertEq(uint256(uint8(b[2])), 0x04);
  }

  // TODO: add tests for other sliceX functions
  function testSlice3() public {
    bytes memory a = new bytes(5);
    a[0] = 0x01;
    a[1] = 0x02;
    a[2] = 0x03;
    a[3] = 0x04;
    a[4] = 0x05;

    uint256 gas = gasleft();
    bytes3 b = Bytes.slice3(a, 1);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(b.length, 3);
    assertEq(uint256(uint8(b[0])), 0x02);
    assertEq(uint256(uint8(b[1])), 0x03);
    assertEq(uint256(uint8(b[2])), 0x04);
  }

  function testSlice32() public {
    bytes32 original = keccak256("some data");
    bytes memory input = bytes.concat(bytes10(keccak256("irrelevant data")), original);

    uint256 gas = gasleft();
    bytes32 output = Bytes.slice32(input, 10);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(output, original);
  }

  function testSetBytes1() public {
    bytes32 input = bytes32(0);

    uint256 gas = gasleft();
    Bytes.setBytes1(input, 8, 0xff);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(Bytes.setBytes1(input, 0, 0x01), bytes32(bytes1(0x01)));
    assertEq(Bytes.setBytes1(input, 31, 0x01), bytes32(uint256(0x01)));
  }

  function testSetBytes2() public {
    bytes32 input = bytes32(0);

    uint256 gas = gasleft();
    Bytes.setBytes2(input, 8, 0xffff);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(Bytes.setBytes2(input, 0, 0xffff), bytes32(bytes2(0xffff)));
    assertEq(Bytes.setBytes2(input, 30, 0xffff), bytes32(uint256(0xffff)));
  }

  function testSetBytes4() public {
    bytes32 input = bytes32(0);

    uint256 gas = gasleft();
    Bytes.setBytes4(input, 8, 0xffffffff);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(Bytes.setBytes4(input, 0, 0xffffffff), bytes32(bytes4(0xffffffff)));
    assertEq(Bytes.setBytes4(input, 30, 0xffffffff), bytes32(uint256(0xffff)));
    assertEq(Bytes.setBytes4(input, 28, 0xffffffff), bytes32(uint256(0xffffffff)));

    bytes32 input2 = bytes32(0x0000000a000a0000000000000000000000000000000000000000000000000000);
    bytes4 overwrite = bytes4(0x0000006d);

    assertEq(
      Bytes.setBytes4(input2, 0, overwrite),
      bytes32(0x0000006d000a0000000000000000000000000000000000000000000000000000)
    );
  }
}
