// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { EncodedLengths, EncodedLengthsLib } from "../src/EncodedLengths.sol";

contract EncodedLengthsTest is Test, GasReporter {
  function testPack1() public {
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(4);
    assertEq(encodedLengths.atIndex(0), 4);

    assertEq(encodedLengths.total(), 4);
  }

  function testPack2() public {
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(4, 8);
    assertEq(encodedLengths.atIndex(0), 4);
    assertEq(encodedLengths.atIndex(1), 8);

    assertEq(encodedLengths.total(), 12);
  }

  function testPack3() public {
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(4, 8, 16);
    assertEq(encodedLengths.atIndex(0), 4);
    assertEq(encodedLengths.atIndex(1), 8);
    assertEq(encodedLengths.atIndex(2), 16);

    assertEq(encodedLengths.total(), 28);
  }

  function testPack4() public {
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(4, 8, 16, 32);
    assertEq(encodedLengths.atIndex(0), 4);
    assertEq(encodedLengths.atIndex(1), 8);
    assertEq(encodedLengths.atIndex(2), 16);
    assertEq(encodedLengths.atIndex(3), 32);

    assertEq(encodedLengths.total(), 60);
  }

  function testPack5() public {
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(4, 8, 16, 32, 64);
    assertEq(encodedLengths.atIndex(0), 4);
    assertEq(encodedLengths.atIndex(1), 8);
    assertEq(encodedLengths.atIndex(2), 16);
    assertEq(encodedLengths.atIndex(3), 32);
    assertEq(encodedLengths.atIndex(4), 64);

    assertEq(encodedLengths.total(), 124);
  }

  function testAtIndex() public returns (uint256 value) {
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(1, 2, 3, 4);

    startGasReport("get value at index of EncodedLengths");
    value = encodedLengths.atIndex(3);
    endGasReport();

    assertEq(encodedLengths.atIndex(0), 1);
    assertEq(encodedLengths.atIndex(1), 2);
    assertEq(encodedLengths.atIndex(2), 3);
    assertEq(encodedLengths.atIndex(3), 4);
  }

  function testSetAtIndex() public {
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(1, 2, 3, 4);

    startGasReport("set value at index of EncodedLengths");
    encodedLengths = encodedLengths.setAtIndex(2, 5);
    endGasReport();

    assertEq(encodedLengths.atIndex(0), 1);
    assertEq(encodedLengths.atIndex(1), 2);
    assertEq(encodedLengths.atIndex(2), 5);
    assertEq(encodedLengths.atIndex(3), 4);
    assertEq(encodedLengths.total(), 12);
  }

  function testGas() public returns (EncodedLengths encodedLengths, uint256 total) {
    bytes32[] memory a1 = new bytes32[](1);
    address[] memory a2 = new address[](2);
    uint8[] memory a3 = new uint8[](3);
    int128[] memory a4 = new int128[](4);

    startGasReport("pack 1 length into EncodedLengths");
    unchecked {
      encodedLengths = EncodedLengthsLib.pack(a1.length * 32);
    }
    endGasReport();
    assertEq(encodedLengths.total(), 1 * 32);

    startGasReport("pack 4 lengths into EncodedLengths");
    unchecked {
      encodedLengths = EncodedLengthsLib.pack(a1.length * 32, a2.length * 20, a3.length * 1, a4.length * 16);
    }
    endGasReport();

    startGasReport("get total of EncodedLengths");
    total = encodedLengths.total();
    endGasReport();
    assertEq(encodedLengths.total(), 1 * 32 + 2 * 20 + 3 * 1 + 4 * 16);
  }

  function testHexEncoding() public {
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(160, 544);
    assertEq(encodedLengths.unwrap(), hex"000000000000000000000000000000000000022000000000a0000000000002c0");
  }
}
