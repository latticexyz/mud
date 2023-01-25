// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Cast } from "../Cast.sol";
import "../Buffer.sol";

contract BufferTest is DSTestPlus {
  function testAllocateBuffer() public {
    uint256 gas = gasleft();
    Buffer buf = Buffer_.allocate(32);
    gas = gas - gasleft();
    console.log("gas used (Buffer_.allocate): %s", gas);

    gas = gasleft();
    buf.length();
    gas = gas - gasleft();
    console.log("gas used (length): %s", gas);

    gas = gasleft();
    buf.ptr();
    gas = gas - gasleft();
    console.log("gas used (ptr): %s", gas);

    gas = gasleft();
    buf.capacity();
    gas = gas - gasleft();
    console.log("gas used (capacity): %s", gas);

    assertEq(uint256(buf.length()), 0);
    assertEq(uint256(buf.capacity()), 32);
  }

  function testFromBytes() public {
    bytes memory data = bytes.concat(bytes8(0x0102030405060708));
    uint256 gas = gasleft();
    Buffer buf = Buffer_.fromBytes(data);
    gas = gas - gasleft();
    console.log("gas used (fromBytes): %s", gas);

    assertEq(uint256(buf.length()), 8);
    assertEq(uint256(buf.capacity()), 8);
    assertEq(keccak256(buf.toBytes()), keccak256(data));
  }

  function testSetLength() public {
    Buffer buf = Buffer_.allocate(32);

    uint256 gas = gasleft();
    buf._setLengthUnchecked(8);
    gas = gas - gasleft();
    console.log("gas used (setLengthUnchecked): %s", gas);

    gas = gasleft();
    buf._setLength(16);
    gas = gas - gasleft();
    console.log("gas used (setLength): %s", gas);

    assertEq(uint256(buf.length()), 16);
    assertEq(uint256(buf.capacity()), 32);
  }

  function testFailSetLength() public pure {
    Buffer buf = Buffer_.allocate(32);
    buf._setLength(33);
  }

  function testAppend() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data1 = bytes.concat(bytes8(0x0102030405060708));
    bytes memory data2 = bytes.concat(bytes8(0x090a0b0c0d0e0f10));

    uint256 gas = gasleft();
    buf._appendUnchecked(data1);
    gas = gas - gasleft();
    console.log("gas used (append unchecked): %s", gas);

    gas = gasleft();
    buf.append(data2);
    gas = gas - gasleft();
    console.log("gas used (append): %s", gas);

    assertEq(uint256(buf.length()), 16);
  }

  function testToBytes() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data1 = bytes.concat(bytes8(0x0102030405060708));
    bytes memory data2 = bytes.concat(bytes8(0x090a0b0c0d0e0f10));
    bytes memory data = bytes.concat(data1, data2);

    buf.append(data1);
    buf.append(data2);

    uint256 gas = gasleft();
    bytes memory bufferData = buf.toBytes();
    gas = gas - gasleft();
    console.log("gas used (toBytes): %s", gas);

    assertEq(keccak256(bufferData), keccak256(data));
  }

  function testRead() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data = bytes.concat(bytes8(0x0102030405060708));
    buf.append(data);

    uint256 gas = gasleft();
    bytes32 value = buf.read32(4);
    gas = gas - gasleft();
    console.log("gas used (read32): %s", gas);

    assertEq(value, bytes32(bytes4(0x05060708)));

    gas = gasleft();
    bytes8 value2 = buf.read8(3);
    gas = gas - gasleft();
    console.log("gas used (read8): %s", gas);

    assertEq(value2, bytes8(bytes5(0x0405060708)));

    gas = gasleft();
    bytes1 value3 = buf.read1(7);
    gas = gas - gasleft();
    console.log("gas used (read1): %s", gas);

    assertEq(value3, bytes1(0x08));
  }

  function testToArrayUint32() public {
    Buffer buf = Buffer_.allocate(32);
    bytes memory data1 = bytes.concat(bytes8(0x0102030405060708));
    buf.append(data1);

    uint256 gas = gasleft();
    uint256 arrayPtr = buf.toArray(4);
    gas = gas - gasleft();
    console.log("gas used (toArray uint32[]): %s", gas);
    uint32[] memory arr = Cast.toUint32Array(arrayPtr);

    assertEq(arr.length, 2);
    assertEq(arr[0], 0x01020304);
    assertEq(arr[1], 0x05060708);
  }

  function testToArrayUint256() public {
    Buffer buf = Buffer_.allocate(8);
    bytes memory data = bytes.concat(bytes8(0x0102030405060708));
    buf.append(data);

    uint256 gas = gasleft();
    uint256 arrayPtr = buf.toArray(4);
    gas = gas - gasleft();
    console.log("gas used (toArray uint256[]): %s", gas);
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

    uint256 gas = gasleft();
    bytes memory slice = buf.slice(4, 4);
    gas = gas - gasleft();
    console.log("gas used (slice): %s", gas);

    assertEq(uint256(slice.length), 4);
    assertEq(keccak256(slice), keccak256(bytes.concat(bytes4(0x05060708))));
  }
}
