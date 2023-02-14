// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SliceLib } from "../../src/Slice.sol";
import { EncodeArray } from "../../src/storagecoder/EncodeArray.sol";

contract StorageCoderTest is Test {
  function testFromAndToUint32Array() public {
    uint32[] memory input = new uint32[](2);
    input[0] = 0x01020304;
    input[1] = 0x05060708;

    bytes memory packed = EncodeArray.encode(input);
    assertEq(packed.length, 8);

    // !gasreport decode packed uint32[]
    uint32[] memory output = SliceLib.fromBytes(packed).toUint32Array();

    assertEq(output.length, 2);
    assertEq(output[0], 0x01020304);
    assertEq(output[1], 0x05060708);
  }

  function testToAndFromBytes24Array() public {
    bytes24[] memory input = new bytes24[](2);
    input[0] = bytes24(0x0102030405060708090a0b0c0d0e0f101112131415161718);
    input[1] = bytes24(0x19202122232425262728292a2b2c2d2e2f30313233343536);

    // !gasreport encode packed bytes24[]
    bytes memory packed = EncodeArray.encode(input);

    assertEq(packed.length, 48);

    // !gasreport decode packed uint32[]
    bytes24[] memory output = SliceLib.fromBytes(packed).toBytes24Array();

    assertEq(output.length, 2);
    assertEq(output[0], input[0]);
    assertEq(output[1], input[1]);
  }
}
