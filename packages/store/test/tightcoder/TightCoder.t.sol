// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { SliceLib } from "../../src/Slice.sol";
import { EncodeArray } from "../../src/tightcoder/EncodeArray.sol";

contract TightCoderTest is Test, GasReporter {
  function testFromAndToUint32Array() public {
    uint32[] memory input = new uint32[](2);
    input[0] = 0x01020304;
    input[1] = 0x05060708;

    bytes memory packed = EncodeArray.encode(input);
    assertEq(packed.length, 8);

    startGasReport("decode packed uint32[]");
    uint32[] memory output = SliceLib.fromBytes(packed).decodeArray_uint32();
    endGasReport();

    assertEq(output.length, 2);
    assertEq(output[0], 0x01020304);
    assertEq(output[1], 0x05060708);
  }

  function testToAndFromBytes24Array() public {
    bytes24[] memory input = new bytes24[](2);
    input[0] = bytes24(0x0102030405060708090a0b0c0d0e0f101112131415161718);
    input[1] = bytes24(0x19202122232425262728292a2b2c2d2e2f30313233343536);

    startGasReport("encode packed bytes24[]");
    bytes memory packed = EncodeArray.encode(input);
    endGasReport();

    assertEq(packed.length, 48);

    startGasReport("decode packed bytes24[]");
    bytes24[] memory output = SliceLib.fromBytes(packed).decodeArray_bytes24();
    endGasReport();

    assertEq(output.length, 2);
    assertEq(output[0], input[0]);
    assertEq(output[1], input[1]);
  }
}
