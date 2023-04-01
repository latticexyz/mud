// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SliceLib } from "../../src/Slice.sol";

contract DecodeSliceTest is Test {
  function testToBytes32Array() public {
    bytes memory input = new bytes(64);
    input[0] = 0x01;
    input[31] = 0x02;
    input[32] = 0x03;
    input[63] = 0x04;

    // !gasreport decode packed bytes32[]
    bytes32[] memory output = SliceLib.fromBytes(input).decodeArray_bytes32();

    assertEq(output.length, 2);
    assertEq(uint256(output[0]), 0x0100000000000000000000000000000000000000000000000000000000000002);
    assertEq(uint256(output[1]), 0x0300000000000000000000000000000000000000000000000000000000000004);
  }

  function testToBytes32ArrayUneven() public {
    bytes memory input = new bytes(65);
    input[0] = 0x01;
    input[31] = 0x02;
    input[32] = 0x03;
    input[63] = 0x04;
    input[64] = 0x05;

    vm.expectRevert("unpackToArray: packedLength must be a multiple of elementSize");
    SliceLib.fromBytes(input).decodeArray_bytes32();
  }

  function testToArrayUint32() public {
    uint32 num1 = 0x01020304;
    uint32 num2 = 0x05060708;
    bytes memory input = abi.encodePacked(num1, num2);

    // !gasreport decode packed uint32[]
    uint32[] memory arr = SliceLib.fromBytes(input).decodeArray_uint32();

    assertEq(arr.length, 2);
    assertEq(arr[0], num1);
    assertEq(arr[1], num2);
  }

  function testToArrayUint32Uneven() public {
    bytes memory input = abi.encodePacked(uint32(1), uint32(2), uint8(3));

    vm.expectRevert("unpackToArray: packedLength must be a multiple of elementSize");
    SliceLib.fromBytes(input).decodeArray_uint32();
  }
}
