// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Cast } from "../Cast.sol";
import "../Buffer.sol";

contract BufferTest is DSTestPlus {
  function testAllocateBuffer() public {
    // !gasreport allocate a buffer
    Buffer buf = Buffer_.allocate(32);

    // !gasreport get buffer length
    buf.length();

    // !gasreport get buffer pointer
    buf.ptr();

    // !gasreport get buffer capacity
    buf.capacity();

    assertEq(uint256(buf.length()), 0);
    assertEq(uint256(buf.capacity()), 32);
  }

  function testFromBytes() public {
    bytes memory data = bytes.concat(bytes8(0x0102030405060708));

    // !gasreport create a buffer from 8 bytes
    Buffer buf = Buffer_.fromBytes(data);

    assertEq(uint256(buf.length()), 8);
    assertEq(uint256(buf.capacity()), 8);
    assertEq(keccak256(buf.toBytes()), keccak256(data));
  }

  function testFromBytesFuzzy(bytes memory data) public {
    Buffer buf = Buffer_.fromBytes(data);
    assertEq(uint256(buf.length()), data.length);
    assertEq(uint256(buf.capacity()), data.length);
    assertEq(keccak256(buf.toBytes()), keccak256(data));
  }

  function testSetLength() public {
    Buffer buf = Buffer_.allocate(32);

    // !gasreport set buffer length unchecked
    buf._setLengthUnchecked(8);

    // !gasreport set buffer length
    buf._setLength(16);

    assertEq(uint256(buf.length()), 16);
    assertEq(uint256(buf.capacity()), 32);
  }

  function testSetLengthFuzzy(bytes memory data, uint16 length) public {
    Buffer buf = Buffer_.fromBytes(data);
    assertEq(uint256(buf.capacity()), data.length);
    buf._setLengthUnchecked(length);
    assertEq(uint256(buf.length()), length);
  }

  function testFailSetLength() public pure {
    Buffer buf = Buffer_.allocate(32);
    buf._setLength(33);
  }

  function testAppend() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data1 = bytes.concat(bytes8(0x0102030405060708));
    bytes memory data2 = bytes.concat(bytes8(0x090a0b0c0d0e0f10));

    // !gasreport append unchecked bytes memory (8) to buffer
    buf.appendUnchecked(data1);

    // !gasreport append bytes memory (8) to buffer
    buf.append(data2);

    assertEq(uint256(buf.length()), 16);
    assertEq(buf.read8(0), bytes8(0x0102030405060708));
    assertEq(buf.read8(8), bytes8(0x090a0b0c0d0e0f10));
  }

  function testAppendFuzzy(
    bytes memory input,
    bytes memory append1,
    bytes memory append2
  ) public {
    Buffer buffer = Buffer_.allocate(uint128(input.length + append1.length + append2.length));
    buffer.append(input);
    buffer.append(append1);
    buffer.append(append2);
    assertEq(keccak256(buffer.toBytes()), keccak256(bytes.concat(input, append1, append2)));
  }

  function testCompareGasToConcat() public {
    bytes memory data1 = bytes.concat(keccak256("data1"));
    bytes memory data2 = bytes.concat(keccak256("data2"));
    bytes memory data3 = bytes.concat(keccak256("data3"));

    // !gasreport concat 3 bytes memory (32) using buffer
    Buffer buf = Buffer_.concat(data1, data2, data3);

    // !gasreport concat 3 bytes memory (32) using bytes.concat
    bytes memory concat = bytes.concat(data1, data2, data3);

    assertEq(keccak256(buf.toBytes()), keccak256(concat));
  }

  function testAppendFixed() public {
    Buffer buf = Buffer_.allocate(32);
    bytes32 data1 = bytes32(bytes8(0x0102030405060708));
    bytes32 data2 = bytes32(bytes8(0x090a0b0c0d0e0f10));

    // !gasreport append unchecked bytes8 of bytes32 to buffer
    buf.appendUnchecked(data1, 8);

    // !gasreport append bytes8 of bytes32 to buffer
    buf.append(data2, 8);

    assertEq(uint256(buf.length()), 16);
    assertEq(buf.read8(0), bytes8(0x0102030405060708));
    assertEq(buf.read8(8), bytes8(0x090a0b0c0d0e0f10));
  }

  function testToBytes() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data1 = bytes.concat(bytes8(0x0102030405060708));
    bytes memory data2 = bytes.concat(bytes8(0x090a0b0c0d0e0f10));
    bytes memory data = bytes.concat(data1, data2);

    buf.append(data1);
    buf.append(data2);

    // !gasreport buffer (32 bytes) to bytes memory
    bytes memory bufferData = buf.toBytes();

    assertEq(keccak256(bufferData), keccak256(data));
  }

  function testRead() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data = bytes.concat(bytes8(0x0102030405060708));
    buf.append(data);

    // !gasreport read bytes32 from buffer
    bytes32 value = buf.read32(4);

    assertEq(value, bytes32(bytes4(0x05060708)));

    // !gasreport read bytes8 with offset 3 from buffer
    bytes8 value2 = buf.read8(3);

    assertEq(value2, bytes8(bytes5(0x0405060708)));

    // !gasreport read bytes1 with offset 7 from buffer
    bytes1 value3 = buf.read1(7);

    assertEq(value3, bytes1(0x08));
  }

  function testToArrayUint32() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data1 = bytes.concat(bytes8(0x0102030405060708));
    buf.append(data1);

    // !gasreport buffer toArray with element length 4
    uint256 arrayPtr = buf.toArray(4);

    // !gasreport convert array pointer to uint32[]
    uint32[] memory arr = Cast.toUint32Array(arrayPtr);

    assertEq(arr.length, 2);
    assertEq(arr[0], 0x01020304);
    assertEq(arr[1], 0x05060708);
  }

  function testToArrayUint256() public {
    Buffer buf = Buffer_.allocate(8);
    bytes memory data = bytes.concat(bytes8(0x0102030405060708));
    buf.append(data);

    uint256 arrayPtr = buf.toArray(4);

    // !gasreport convert array pointer to uint256[]
    uint256[] memory arr = Cast.toUint256Array(arrayPtr);

    assertEq(arr.length, 2);
    assertEq(arr[0], 0x01020304);
    assertEq(arr[1], 0x05060708);
  }

  function testToArrayUint256TrailingData() public {
    Buffer buf = Buffer_.allocate(10);
    bytes memory data = bytes.concat(bytes8(0x0102030405060708), bytes2(0x090a));
    buf.append(data);
    uint256 arrayPtr = buf.toArray(4);
    uint256[] memory arr = Cast.toUint256Array(arrayPtr);

    // The trailing bytes2 data is ignored because it doesn't align with one `elementSize`
    assertEq(arr.length, 2);
    assertEq(arr[0], 0x01020304);
    assertEq(arr[1], 0x05060708);
  }

  function testSlice() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data = bytes.concat(bytes8(0x0102030405060708));
    buf.append(data);

    // !gasreport slice 4 bytes from buffer with offset 4
    bytes memory slice = buf.slice(4, 4);

    assertEq(uint256(slice.length), 4);
    assertEq(keccak256(slice), keccak256(bytes.concat(bytes4(0x05060708))));
  }
}
