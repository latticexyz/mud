// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { Bytes } from "../Bytes.sol";

contract BytesTest is Test {
  function testFromBytesArray() public {
    bytes[] memory input = new bytes[](2);
    input[0] = new bytes(32);
    input[0][0] = 0x01;
    input[0][31] = 0x02;
    input[1] = new bytes(32);
    input[1][0] = 0x03;
    input[1][31] = 0x04;

    // !gasreport create bytes from bytes array
    bytes memory output = Bytes.from(input);

    assertEq(output.length, 64);
    assertEq(uint256(Bytes.toBytes32(output, 0)), 0x0100000000000000000000000000000000000000000000000000000000000002);
    assertEq(uint256(Bytes.toBytes32(output, 32)), 0x0300000000000000000000000000000000000000000000000000000000000004);
  }

  function testFromUint8Array() public {
    uint8[] memory input = new uint8[](2);
    input[0] = 0x01;
    input[1] = 0x02;

    // !gasreport create bytes from uint8 array
    bytes memory output = Bytes.from(input);

    assertEq(output.length, 2);
    assertEq(uint256(uint8(output[0])), 0x01);
    assertEq(uint256(uint8(output[1])), 0x02);
  }

  function testFromUint16Array() public {
    uint16[] memory input = new uint16[](3);
    input[0] = 0x0102;
    input[1] = 0x0304;
    input[2] = 0x0506;

    // !gasreport create bytes from uint16 array
    bytes memory output = Bytes.from(input);

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

    // !gasreport create bytes from uint32 array
    bytes memory output = Bytes.from(input);

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

    // !gasreport create bytes32 from bytes memory with offset 0
    bytes32 output = Bytes.toBytes32(input, 0);

    assertEq(uint256(output), 0x0100000000000000000000000000000000000000000000000000000000000002);
  }

  function testToBytes32CrossWord() public {
    bytes memory input = new bytes(64);
    input[0 + 16] = 0x01;
    input[31 + 16] = 0x02;

    // !gasreport create bytes32 from bytes memory with offset 16
    bytes32 output = Bytes.toBytes32(input, 16);

    assertEq(uint256(output), 0x0100000000000000000000000000000000000000000000000000000000000002);
  }

  function testToBytes32Array() public {
    bytes memory input = new bytes(64);
    input[0] = 0x01;
    input[31] = 0x02;
    input[32] = 0x03;
    input[63] = 0x04;

    // !gasreport create bytes32 array from bytes memory
    bytes32[] memory output = Bytes.toBytes32Array(input);

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

    // !gasreport create uint32 array from bytes memory
    uint32[] memory output = Bytes.toUint32Array(tight);

    assertEq(output.length, 2);
    assertEq(output[0], 0x01020304);
    assertEq(output[1], 0x05060708);
  }

  function testToAndFromBytes24Array() public {
    bytes24[] memory input = new bytes24[](2);
    input[0] = bytes24(0x0102030405060708090a0b0c0d0e0f101112131415161718);
    input[1] = bytes24(0x19202122232425262728292a2b2c2d2e2f30313233343536);

    // !gasreport tightly pack bytes24 array into bytes array
    bytes memory tight = Bytes.from(input);

    assertEq(tight.length, 48);

    // !gasreport create uint32 array from bytes memory
    bytes24[] memory output = Bytes.toBytes24Array(tight);

    assertEq(output.length, 2);
    assertEq(output[0], input[0]);
    assertEq(output[1], input[1]);
  }

  function testToBytes32ArrayUneven() public {
    bytes memory input = new bytes(65);
    input[0] = 0x01;
    input[31] = 0x02;
    input[32] = 0x03;
    input[63] = 0x04;
    input[64] = 0x05;

    // !gasreport create bytes32 array from bytes memory with uneven length
    bytes32[] memory output = Bytes.toBytes32Array(input);

    assertEq(output.length, 3);
    assertEq(uint256(output[0]), 0x0100000000000000000000000000000000000000000000000000000000000002);
    assertEq(uint256(output[1]), 0x0300000000000000000000000000000000000000000000000000000000000004);
    assertEq(uint256(output[2]), 0x0500000000000000000000000000000000000000000000000000000000000000);
  }

  function testFromAndToUint32() public {
    uint32 input = 0x01000002;

    // !gasreport create bytes from uint32
    bytes memory output = Bytes.from(input);

    assertEq(output.length, 4);

    // !gasreport create uint32 from bytes
    uint32 output2 = Bytes.toUint32(output);

    assertEq(output2, input);
  }

  function testFromAndToUint32Fuzzy(uint32 input) public {
    assertEq(Bytes.toUint32(Bytes.from(input)), input);
  }

  function testFromAndToAddress() public {
    address input = address(0x0100000000000000000000000000000000000002);

    // !gasreport create bytes from address
    bytes memory output = Bytes.from(input);

    assertEq(output.length, 20);

    // !gasreport create address from bytes
    address output2 = Bytes.toAddress(output);

    assertEq(output2, input);
  }

  function testFromAndToAddressFuzzy(address input) public {
    assertEq(Bytes.toAddress(Bytes.from(input)), input);
  }

  function testFromAndToUint8() public {
    uint8 input = 0x02;

    // !gasreport create bytes from uint8
    bytes memory output = Bytes.fromUint8(input);

    assertEq(output.length, 1);

    // !gasreport create uint8 from bytes
    uint8 output2 = Bytes.toUint8(output);

    assertEq(output2, input);
  }

  function testFromAndToUint8Fuzzy(uint8 input) public {
    assertEq(Bytes.toUint8(Bytes.fromUint8(input)), input);
  }

  function testFromAndToBytes4() public {
    bytes4 input = bytes4(0x01000002);

    // !gasreport create bytes from bytes4
    bytes memory output = Bytes.from(input);

    assertEq(output.length, 4);

    // !gasreport create bytes4 from bytes
    bytes4 output2 = Bytes.toBytes4(output);

    assertEq(output2, input);
  }

  function testFromAndToBytes4Fuzzy(bytes4 input) public {
    assertEq(Bytes.toBytes4(Bytes.from(input)), input);
  }

  function testEquals() public {
    bytes memory a = bytes("a");
    bytes memory b = bytes("a");

    // !gasreport compare equal bytes
    bool equals = Bytes.equals(a, b);

    assertTrue(equals);
  }

  function testEqualsFalse() public {
    bytes memory a = bytes("a");
    bytes memory b = bytes("b");

    // !gasreport compare unequal bytes
    bool equals = Bytes.equals(a, b);

    assertFalse(equals);
  }

  function testEqualsFalseDiffLength() public {
    bytes memory a = bytes("a");
    bytes memory b = bytes("aa");
    assertFalse(Bytes.equals(a, b));
  }

  function testSetLengthInPlace() public {
    bytes memory a = new bytes(5);
    assertEq(a.length, 5);

    // !gasreport set length of bytes in place
    Bytes.setLengthInPlace(a, 2);

    assertEq(a.length, 2);
  }

  function testSlice() public {
    bytes memory a = new bytes(5);
    a[0] = 0x01;
    a[1] = 0x02;
    a[2] = 0x03;
    a[3] = 0x04;
    a[4] = 0x05;

    // !gasreport slice bytes (with copying) with offset 1 and length 3
    bytes memory b = Bytes.slice(a, 1, 3);

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

    // !gasreport slice bytes3 with offset 1
    bytes3 b = Bytes.slice3(a, 1);

    assertEq(b.length, 3);
    assertEq(uint256(uint8(b[0])), 0x02);
    assertEq(uint256(uint8(b[1])), 0x03);
    assertEq(uint256(uint8(b[2])), 0x04);
  }

  function testSlice32() public {
    bytes32 original = keccak256("some data");
    bytes memory input = bytes.concat(bytes10(keccak256("irrelevant data")), original);

    // !gasreport slice bytes32 with offset 10
    bytes32 output = Bytes.slice32(input, 10);

    assertEq(output, original);
  }

  function testSetBytes1() public {
    bytes32 input = bytes32(0);

    // !gasreport set bytes1 in bytes32
    Bytes.setBytes1(input, 8, 0xff);

    assertEq(Bytes.setBytes1(input, 0, 0x01), bytes32(bytes1(0x01)));
    assertEq(Bytes.setBytes1(input, 31, 0x01), bytes32(uint256(0x01)));
  }

  function testSetBytes2() public {
    bytes32 input = bytes32(0);

    // !gasreport set bytes2 in bytes32
    Bytes.setBytes2(input, 8, 0xffff);

    assertEq(Bytes.setBytes2(input, 0, 0xffff), bytes32(bytes2(0xffff)));
    assertEq(Bytes.setBytes2(input, 30, 0xffff), bytes32(uint256(0xffff)));
  }

  function testSetBytes4() public {
    bytes32 input = bytes32(0);

    // !gasreport set bytes4 in bytes32
    Bytes.setBytes4(input, 8, 0xffffffff);

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
