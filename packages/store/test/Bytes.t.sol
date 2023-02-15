// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { Bytes } from "../src/Bytes.sol";

contract BytesTest is Test {
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
    bytes memory input = abi.encodePacked(bytes10(keccak256("irrelevant data")), original);

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
