// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Bytes } from "../src/Bytes.sol";

contract BytesTest is Test, GasReporter {
  // TODO: add tests for other sliceX functions
  function testSlice3() public {
    bytes memory a = new bytes(5);
    a[0] = 0x01;
    a[1] = 0x02;
    a[2] = 0x03;
    a[3] = 0x04;
    a[4] = 0x05;

    startGasReport("slice bytes3 with offset 1");
    bytes3 b = Bytes.slice3(a, 1);
    endGasReport();

    assertEq(b.length, 3);
    assertEq(uint256(uint8(b[0])), 0x02);
    assertEq(uint256(uint8(b[1])), 0x03);
    assertEq(uint256(uint8(b[2])), 0x04);
  }

  function testSlice32() public {
    bytes32 original = keccak256("some data");
    bytes memory input = abi.encodePacked(bytes10(keccak256("irrelevant data")), original);

    startGasReport("slice bytes32 with offset 10");
    bytes32 output = Bytes.slice32(input, 10);
    endGasReport();

    assertEq(output, original);
  }

  function testSetBytes4Memory() public {
    bytes4 first = bytes4(0x1000000a);
    bytes32 remainder = bytes32(keccak256("some data"));
    bytes4 overwrite = bytes4(0x2000000b);

    bytes memory input = abi.encodePacked(first, remainder);

    startGasReport("set bytes4 in bytes memory");
    bytes memory result = Bytes.setBytes4(input, 0, overwrite);
    endGasReport();

    // First 4 bytes should be overwritten
    assertEq(bytes4(result), overwrite);
    assertEq(keccak256(result), keccak256(abi.encodePacked(overwrite, remainder)));

    // Operation happened in-place
    assertEq(keccak256(input), keccak256(result));
  }
}
