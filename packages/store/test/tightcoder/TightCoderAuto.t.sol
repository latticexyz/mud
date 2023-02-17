// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { Bytes } from "../../src/Bytes.sol";
import { EncodeArray } from "../../src/tightcoder/EncodeArray.sol";
import { SliceLib } from "../../src/Slice.sol";

contract TightCoderAutoTest is Test {
  /************************************************************************
   *
   *    uint8 - uint256
   *
   ************************************************************************/

  function testEncodeDecodeArray_uint8(
    uint8 val0,
    uint8 val1,
    uint8 val2
  ) public {
    uint8[] memory input = new uint8[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint8[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint8();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint16(
    uint16 val0,
    uint16 val1,
    uint16 val2
  ) public {
    uint16[] memory input = new uint16[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint16[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint16();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint24(
    uint24 val0,
    uint24 val1,
    uint24 val2
  ) public {
    uint24[] memory input = new uint24[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint24[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint24();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint32(
    uint32 val0,
    uint32 val1,
    uint32 val2
  ) public {
    uint32[] memory input = new uint32[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint32[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint32();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint40(
    uint40 val0,
    uint40 val1,
    uint40 val2
  ) public {
    uint40[] memory input = new uint40[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint40[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint40();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint48(
    uint48 val0,
    uint48 val1,
    uint48 val2
  ) public {
    uint48[] memory input = new uint48[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint48[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint48();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint56(
    uint56 val0,
    uint56 val1,
    uint56 val2
  ) public {
    uint56[] memory input = new uint56[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint56[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint56();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint64(
    uint64 val0,
    uint64 val1,
    uint64 val2
  ) public {
    uint64[] memory input = new uint64[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint64[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint64();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint72(
    uint72 val0,
    uint72 val1,
    uint72 val2
  ) public {
    uint72[] memory input = new uint72[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint72[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint72();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint80(
    uint80 val0,
    uint80 val1,
    uint80 val2
  ) public {
    uint80[] memory input = new uint80[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint80[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint80();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint88(
    uint88 val0,
    uint88 val1,
    uint88 val2
  ) public {
    uint88[] memory input = new uint88[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint88[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint88();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint96(
    uint96 val0,
    uint96 val1,
    uint96 val2
  ) public {
    uint96[] memory input = new uint96[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint96[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint96();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint104(
    uint104 val0,
    uint104 val1,
    uint104 val2
  ) public {
    uint104[] memory input = new uint104[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint104[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint104();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint112(
    uint112 val0,
    uint112 val1,
    uint112 val2
  ) public {
    uint112[] memory input = new uint112[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint112[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint112();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint120(
    uint120 val0,
    uint120 val1,
    uint120 val2
  ) public {
    uint120[] memory input = new uint120[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint120[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint120();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint128(
    uint128 val0,
    uint128 val1,
    uint128 val2
  ) public {
    uint128[] memory input = new uint128[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint128[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint128();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint136(
    uint136 val0,
    uint136 val1,
    uint136 val2
  ) public {
    uint136[] memory input = new uint136[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint136[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint136();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint144(
    uint144 val0,
    uint144 val1,
    uint144 val2
  ) public {
    uint144[] memory input = new uint144[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint144[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint144();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint152(
    uint152 val0,
    uint152 val1,
    uint152 val2
  ) public {
    uint152[] memory input = new uint152[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint152[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint152();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint160(
    uint160 val0,
    uint160 val1,
    uint160 val2
  ) public {
    uint160[] memory input = new uint160[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint160[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint160();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint168(
    uint168 val0,
    uint168 val1,
    uint168 val2
  ) public {
    uint168[] memory input = new uint168[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint168[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint168();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint176(
    uint176 val0,
    uint176 val1,
    uint176 val2
  ) public {
    uint176[] memory input = new uint176[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint176[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint176();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint184(
    uint184 val0,
    uint184 val1,
    uint184 val2
  ) public {
    uint184[] memory input = new uint184[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint184[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint184();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint192(
    uint192 val0,
    uint192 val1,
    uint192 val2
  ) public {
    uint192[] memory input = new uint192[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint192[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint192();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint200(
    uint200 val0,
    uint200 val1,
    uint200 val2
  ) public {
    uint200[] memory input = new uint200[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint200[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint200();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint208(
    uint208 val0,
    uint208 val1,
    uint208 val2
  ) public {
    uint208[] memory input = new uint208[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint208[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint208();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint216(
    uint216 val0,
    uint216 val1,
    uint216 val2
  ) public {
    uint216[] memory input = new uint216[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint216[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint216();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint224(
    uint224 val0,
    uint224 val1,
    uint224 val2
  ) public {
    uint224[] memory input = new uint224[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint224[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint224();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint232(
    uint232 val0,
    uint232 val1,
    uint232 val2
  ) public {
    uint232[] memory input = new uint232[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint232[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint232();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint240(
    uint240 val0,
    uint240 val1,
    uint240 val2
  ) public {
    uint240[] memory input = new uint240[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint240[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint240();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint248(
    uint248 val0,
    uint248 val1,
    uint248 val2
  ) public {
    uint248[] memory input = new uint248[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint248[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint248();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_uint256(
    uint256 val0,
    uint256 val1,
    uint256 val2
  ) public {
    uint256[] memory input = new uint256[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    uint256[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_uint256();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  /************************************************************************
   *
   *    int8 - int256
   *
   ************************************************************************/

  function testEncodeDecodeArray_int8(
    int8 val0,
    int8 val1,
    int8 val2
  ) public {
    int8[] memory input = new int8[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int8[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int8();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int16(
    int16 val0,
    int16 val1,
    int16 val2
  ) public {
    int16[] memory input = new int16[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int16[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int16();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int24(
    int24 val0,
    int24 val1,
    int24 val2
  ) public {
    int24[] memory input = new int24[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int24[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int24();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int32(
    int32 val0,
    int32 val1,
    int32 val2
  ) public {
    int32[] memory input = new int32[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int32[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int32();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int40(
    int40 val0,
    int40 val1,
    int40 val2
  ) public {
    int40[] memory input = new int40[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int40[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int40();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int48(
    int48 val0,
    int48 val1,
    int48 val2
  ) public {
    int48[] memory input = new int48[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int48[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int48();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int56(
    int56 val0,
    int56 val1,
    int56 val2
  ) public {
    int56[] memory input = new int56[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int56[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int56();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int64(
    int64 val0,
    int64 val1,
    int64 val2
  ) public {
    int64[] memory input = new int64[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int64[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int64();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int72(
    int72 val0,
    int72 val1,
    int72 val2
  ) public {
    int72[] memory input = new int72[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int72[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int72();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int80(
    int80 val0,
    int80 val1,
    int80 val2
  ) public {
    int80[] memory input = new int80[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int80[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int80();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int88(
    int88 val0,
    int88 val1,
    int88 val2
  ) public {
    int88[] memory input = new int88[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int88[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int88();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int96(
    int96 val0,
    int96 val1,
    int96 val2
  ) public {
    int96[] memory input = new int96[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int96[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int96();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int104(
    int104 val0,
    int104 val1,
    int104 val2
  ) public {
    int104[] memory input = new int104[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int104[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int104();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int112(
    int112 val0,
    int112 val1,
    int112 val2
  ) public {
    int112[] memory input = new int112[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int112[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int112();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int120(
    int120 val0,
    int120 val1,
    int120 val2
  ) public {
    int120[] memory input = new int120[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int120[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int120();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int128(
    int128 val0,
    int128 val1,
    int128 val2
  ) public {
    int128[] memory input = new int128[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int128[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int128();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int136(
    int136 val0,
    int136 val1,
    int136 val2
  ) public {
    int136[] memory input = new int136[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int136[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int136();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int144(
    int144 val0,
    int144 val1,
    int144 val2
  ) public {
    int144[] memory input = new int144[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int144[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int144();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int152(
    int152 val0,
    int152 val1,
    int152 val2
  ) public {
    int152[] memory input = new int152[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int152[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int152();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int160(
    int160 val0,
    int160 val1,
    int160 val2
  ) public {
    int160[] memory input = new int160[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int160[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int160();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int168(
    int168 val0,
    int168 val1,
    int168 val2
  ) public {
    int168[] memory input = new int168[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int168[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int168();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int176(
    int176 val0,
    int176 val1,
    int176 val2
  ) public {
    int176[] memory input = new int176[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int176[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int176();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int184(
    int184 val0,
    int184 val1,
    int184 val2
  ) public {
    int184[] memory input = new int184[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int184[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int184();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int192(
    int192 val0,
    int192 val1,
    int192 val2
  ) public {
    int192[] memory input = new int192[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int192[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int192();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int200(
    int200 val0,
    int200 val1,
    int200 val2
  ) public {
    int200[] memory input = new int200[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int200[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int200();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int208(
    int208 val0,
    int208 val1,
    int208 val2
  ) public {
    int208[] memory input = new int208[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int208[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int208();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int216(
    int216 val0,
    int216 val1,
    int216 val2
  ) public {
    int216[] memory input = new int216[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int216[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int216();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int224(
    int224 val0,
    int224 val1,
    int224 val2
  ) public {
    int224[] memory input = new int224[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int224[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int224();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int232(
    int232 val0,
    int232 val1,
    int232 val2
  ) public {
    int232[] memory input = new int232[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int232[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int232();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int240(
    int240 val0,
    int240 val1,
    int240 val2
  ) public {
    int240[] memory input = new int240[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int240[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int240();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int248(
    int248 val0,
    int248 val1,
    int248 val2
  ) public {
    int248[] memory input = new int248[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int248[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int248();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_int256(
    int256 val0,
    int256 val1,
    int256 val2
  ) public {
    int256[] memory input = new int256[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    int256[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_int256();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  /************************************************************************
   *
   *    bytes1 - bytes32
   *
   ************************************************************************/

  function testEncodeDecodeArray_bytes1(
    bytes1 val0,
    bytes1 val1,
    bytes1 val2
  ) public {
    bytes1[] memory input = new bytes1[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes1[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes1();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes2(
    bytes2 val0,
    bytes2 val1,
    bytes2 val2
  ) public {
    bytes2[] memory input = new bytes2[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes2[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes2();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes3(
    bytes3 val0,
    bytes3 val1,
    bytes3 val2
  ) public {
    bytes3[] memory input = new bytes3[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes3[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes3();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes4(
    bytes4 val0,
    bytes4 val1,
    bytes4 val2
  ) public {
    bytes4[] memory input = new bytes4[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes4[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes4();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes5(
    bytes5 val0,
    bytes5 val1,
    bytes5 val2
  ) public {
    bytes5[] memory input = new bytes5[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes5[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes5();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes6(
    bytes6 val0,
    bytes6 val1,
    bytes6 val2
  ) public {
    bytes6[] memory input = new bytes6[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes6[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes6();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes7(
    bytes7 val0,
    bytes7 val1,
    bytes7 val2
  ) public {
    bytes7[] memory input = new bytes7[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes7[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes7();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes8(
    bytes8 val0,
    bytes8 val1,
    bytes8 val2
  ) public {
    bytes8[] memory input = new bytes8[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes8[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes8();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes9(
    bytes9 val0,
    bytes9 val1,
    bytes9 val2
  ) public {
    bytes9[] memory input = new bytes9[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes9[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes9();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes10(
    bytes10 val0,
    bytes10 val1,
    bytes10 val2
  ) public {
    bytes10[] memory input = new bytes10[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes10[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes10();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes11(
    bytes11 val0,
    bytes11 val1,
    bytes11 val2
  ) public {
    bytes11[] memory input = new bytes11[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes11[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes11();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes12(
    bytes12 val0,
    bytes12 val1,
    bytes12 val2
  ) public {
    bytes12[] memory input = new bytes12[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes12[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes12();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes13(
    bytes13 val0,
    bytes13 val1,
    bytes13 val2
  ) public {
    bytes13[] memory input = new bytes13[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes13[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes13();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes14(
    bytes14 val0,
    bytes14 val1,
    bytes14 val2
  ) public {
    bytes14[] memory input = new bytes14[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes14[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes14();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes15(
    bytes15 val0,
    bytes15 val1,
    bytes15 val2
  ) public {
    bytes15[] memory input = new bytes15[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes15[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes15();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes16(
    bytes16 val0,
    bytes16 val1,
    bytes16 val2
  ) public {
    bytes16[] memory input = new bytes16[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes16[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes16();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes17(
    bytes17 val0,
    bytes17 val1,
    bytes17 val2
  ) public {
    bytes17[] memory input = new bytes17[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes17[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes17();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes18(
    bytes18 val0,
    bytes18 val1,
    bytes18 val2
  ) public {
    bytes18[] memory input = new bytes18[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes18[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes18();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes19(
    bytes19 val0,
    bytes19 val1,
    bytes19 val2
  ) public {
    bytes19[] memory input = new bytes19[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes19[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes19();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes20(
    bytes20 val0,
    bytes20 val1,
    bytes20 val2
  ) public {
    bytes20[] memory input = new bytes20[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes20[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes20();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes21(
    bytes21 val0,
    bytes21 val1,
    bytes21 val2
  ) public {
    bytes21[] memory input = new bytes21[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes21[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes21();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes22(
    bytes22 val0,
    bytes22 val1,
    bytes22 val2
  ) public {
    bytes22[] memory input = new bytes22[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes22[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes22();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes23(
    bytes23 val0,
    bytes23 val1,
    bytes23 val2
  ) public {
    bytes23[] memory input = new bytes23[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes23[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes23();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes24(
    bytes24 val0,
    bytes24 val1,
    bytes24 val2
  ) public {
    bytes24[] memory input = new bytes24[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes24[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes24();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes25(
    bytes25 val0,
    bytes25 val1,
    bytes25 val2
  ) public {
    bytes25[] memory input = new bytes25[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes25[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes25();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes26(
    bytes26 val0,
    bytes26 val1,
    bytes26 val2
  ) public {
    bytes26[] memory input = new bytes26[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes26[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes26();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes27(
    bytes27 val0,
    bytes27 val1,
    bytes27 val2
  ) public {
    bytes27[] memory input = new bytes27[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes27[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes27();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes28(
    bytes28 val0,
    bytes28 val1,
    bytes28 val2
  ) public {
    bytes28[] memory input = new bytes28[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes28[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes28();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes29(
    bytes29 val0,
    bytes29 val1,
    bytes29 val2
  ) public {
    bytes29[] memory input = new bytes29[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes29[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes29();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes30(
    bytes30 val0,
    bytes30 val1,
    bytes30 val2
  ) public {
    bytes30[] memory input = new bytes30[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes30[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes30();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes31(
    bytes31 val0,
    bytes31 val1,
    bytes31 val2
  ) public {
    bytes31[] memory input = new bytes31[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes31[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes31();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }

  function testEncodeDecodeArray_bytes32(
    bytes32 val0,
    bytes32 val1,
    bytes32 val2
  ) public {
    bytes32[] memory input = new bytes32[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    bytes memory encoded = EncodeArray.encode(input);
    assertEq(encoded, abi.encodePacked(val0, val1, val2));

    bytes32[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_bytes32();
    assertEq(decoded.length, 3);
    assertEq(decoded[0], val0);
    assertEq(decoded[1], val1);
    assertEq(decoded[2], val2);
  }
}
