// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Memory } from "../src/Memory.sol";
import { Slice, SliceLib } from "../src/Slice.sol";

contract SliceTest is Test, GasReporter {
  function testFromBytes() public {
    bytes memory data = abi.encodePacked(bytes8(0x0102030405060708));

    startGasReport("make Slice from bytes");
    Slice slice = SliceLib.fromBytes(data);
    endGasReport();

    startGasReport("get Slice length");
    uint256 length = slice.length();
    endGasReport();

    startGasReport("get Slice pointer");
    uint256 pointer = slice.pointer();
    endGasReport();

    assertEq(length, 8);
    assertEq(pointer, Memory.dataPointer(data));
    assertEq(slice.toBytes(), data);
  }

  function testFromBytesFuzzy(bytes memory data) public {
    Slice slice = SliceLib.fromBytes(data);
    assertEq(slice.length(), data.length);
    assertEq(slice.pointer(), Memory.dataPointer(data));
    assertEq(slice.toBytes(), data);
  }

  function testToBytes32() public {
    bytes memory input = new bytes(32);
    input[0] = 0x01;
    input[31] = 0x02;
    Slice slice = SliceLib.fromBytes(input);

    startGasReport("Slice to bytes32");
    bytes32 output = slice.toBytes32();
    endGasReport();

    assertEq(uint256(output), 0x0100000000000000000000000000000000000000000000000000000000000002);
  }

  function testToBytes() public {
    Slice slice;
    bytes memory data0 = hex"";
    bytes memory data2 = hex"0102";
    bytes memory data32 = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20";
    bytes memory data34 = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122";
    bytes memory data1024 = new bytes(1024);
    bytes memory data1024x1024 = new bytes(1024 * 1024);

    slice = SliceLib.fromBytes(data0);
    startGasReport("Slice (0 bytes) to bytes memory");
    bytes memory sliceData0 = slice.toBytes();
    endGasReport();

    slice = SliceLib.fromBytes(data2);
    startGasReport("Slice (2 bytes) to bytes memory");
    bytes memory sliceData2 = slice.toBytes();
    endGasReport();

    slice = SliceLib.fromBytes(data32);
    startGasReport("Slice (32 bytes) to bytes memory");
    bytes memory sliceData32 = slice.toBytes();
    endGasReport();

    slice = SliceLib.fromBytes(data34);
    startGasReport("Slice (34 bytes) to bytes memory");
    bytes memory sliceData34 = slice.toBytes();
    endGasReport();

    slice = SliceLib.fromBytes(data1024);
    startGasReport("Slice (1024 bytes) to bytes memory");
    bytes memory sliceData1024 = slice.toBytes();
    endGasReport();

    slice = SliceLib.fromBytes(data1024x1024);
    startGasReport("Slice (1024x1024 bytes) to bytes memory");
    bytes memory sliceData1024x1024 = slice.toBytes();
    endGasReport();

    assertEq(sliceData0, data0);
    assertEq(sliceData2, data2);
    assertEq(sliceData32, data32);
    assertEq(sliceData34, data34);
    assertEq(sliceData1024, data1024);
    assertEq(sliceData1024x1024, data1024x1024);
  }

  function testSubslice() public {
    bytes memory data1 = hex"010203";
    bytes memory data2 = hex"0405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f2021222324";
    bytes memory data = abi.encodePacked(hex"00", data1, data2);

    startGasReport("subslice bytes (no copy) [1:4]");
    Slice slice1 = SliceLib.getSubslice(data, 1, 1 + 3);
    endGasReport();

    startGasReport("subslice bytes (no copy) [4:37]");
    Slice slice2 = SliceLib.getSubslice(data, 4, 4 + 33);
    endGasReport();

    assertEq(slice1.length(), 3);
    assertEq(slice2.length(), 33);
    assertEq(slice1.toBytes(), data1);
    assertEq(slice2.toBytes(), data2);
  }

  function testSubsliceFuzzy(bytes calldata _b) public {
    uint256 start = _b.length == 0 ? 0 : uint256(keccak256(abi.encode(_b, "start"))) % _b.length;
    uint256 end = _b.length == 0 ? 0 : uint256(keccak256(abi.encode(_b, "end"))) % _b.length;
    vm.assume(start <= end);
    Slice subslice = SliceLib.getSubslice(_b, start, end);
    // Compare getSubslice to calldata slicing
    assertEq(subslice.toBytes(), _b[start:end]);
  }
}
