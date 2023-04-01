// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { SliceLib } from "../../src/Slice.sol";
import { EncodeArray } from "../../src/tightcoder/EncodeArray.sol";

contract TightCoderTest is Test {
  function testFromAndToUint32Array() public {
    uint32[] memory input = new uint32[](2);
    input[0] = 0x01020304;
    input[1] = 0x05060708;

    bytes memory packed = EncodeArray.encode(input);
    assertEq(packed.length, 8);

    // !gasreport decode packed uint32[]
    uint32[] memory output = SliceLib.fromBytes(packed).decodeArray_uint32();

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
    bytes24[] memory output = SliceLib.fromBytes(packed).decodeArray_bytes24();

    assertEq(output.length, 2);
    assertEq(output[0], input[0]);
    assertEq(output[1], input[1]);
  }

  /************************************************************************
   *
   *    Other types
   *
   ************************************************************************/

  function testEncodeDecodeArray__address(
    address val0,
    address val1,
    address val2
  ) public {
    address[] memory input = new address[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory output = EncodeArray.encode(input);

    assertEq(output, abi.encodePacked(val0, val1, val2));
  }

  function testEncodeDecodeArray__bool(
    bool val0,
    bool val1,
    bool val2
  ) public {
    bool[] memory input = new bool[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bool[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bool();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray__SchemaType() public {
    SchemaType val0 = SchemaType.UINT8;
    SchemaType val1 = SchemaType.INT128;
    SchemaType val2 = SchemaType.STRING;
    SchemaType[] memory input = new SchemaType[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    SchemaType[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_SchemaType();
    assertEq(decoded.length, 3);
    assertEq(uint8(decoded[0]), uint8(val0));
    assertEq(uint8(decoded[1]), uint8(val1));
    assertEq(uint8(decoded[2]), uint8(val2));
  }
}
