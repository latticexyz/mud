// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { PackedCounter, PackedCounterLib } from "../src/PackedCounter.sol";

contract PackedCounterTest is Test, GasReporter {
  function testPack1() public {
    PackedCounter packedCounter = PackedCounterLib.pack(4);
    assertEq(packedCounter.atIndex(0), 4);

    assertEq(packedCounter.total(), 4);
  }

  function testPack2() public {
    PackedCounter packedCounter = PackedCounterLib.pack(4, 8);
    assertEq(packedCounter.atIndex(0), 4);
    assertEq(packedCounter.atIndex(1), 8);

    assertEq(packedCounter.total(), 12);
  }

  function testPack3() public {
    PackedCounter packedCounter = PackedCounterLib.pack(4, 8, 16);
    assertEq(packedCounter.atIndex(0), 4);
    assertEq(packedCounter.atIndex(1), 8);
    assertEq(packedCounter.atIndex(2), 16);

    assertEq(packedCounter.total(), 28);
  }

  function testPack4() public {
    PackedCounter packedCounter = PackedCounterLib.pack(4, 8, 16, 32);
    assertEq(packedCounter.atIndex(0), 4);
    assertEq(packedCounter.atIndex(1), 8);
    assertEq(packedCounter.atIndex(2), 16);
    assertEq(packedCounter.atIndex(3), 32);

    assertEq(packedCounter.total(), 60);
  }

  function testPack5() public {
    PackedCounter packedCounter = PackedCounterLib.pack(4, 8, 16, 32, 64);
    assertEq(packedCounter.atIndex(0), 4);
    assertEq(packedCounter.atIndex(1), 8);
    assertEq(packedCounter.atIndex(2), 16);
    assertEq(packedCounter.atIndex(3), 32);
    assertEq(packedCounter.atIndex(4), 64);

    assertEq(packedCounter.total(), 124);
  }

  function testAtIndex() public returns (uint256 value) {
    PackedCounter packedCounter = PackedCounterLib.pack(1, 2, 3, 4);

    startGasReport("get value at index of PackedCounter");
    value = packedCounter.atIndex(3);
    endGasReport();

    assertEq(packedCounter.atIndex(0), 1);
    assertEq(packedCounter.atIndex(1), 2);
    assertEq(packedCounter.atIndex(2), 3);
    assertEq(packedCounter.atIndex(3), 4);
  }

  function testSetAtIndex() public {
    PackedCounter packedCounter = PackedCounterLib.pack(1, 2, 3, 4);

    startGasReport("set value at index of PackedCounter");
    packedCounter = packedCounter.setAtIndex(2, 5);
    endGasReport();

    assertEq(packedCounter.atIndex(0), 1);
    assertEq(packedCounter.atIndex(1), 2);
    assertEq(packedCounter.atIndex(2), 5);
    assertEq(packedCounter.atIndex(3), 4);
    assertEq(packedCounter.total(), 12);
  }

  function testGas() public returns (PackedCounter packedCounter, uint256 total) {
    bytes32[] memory a1 = new bytes32[](1);
    address[] memory a2 = new address[](2);
    uint8[] memory a3 = new uint8[](3);
    int128[] memory a4 = new int128[](4);

    startGasReport("pack 1 length into PackedCounter");
    unchecked {
      packedCounter = PackedCounterLib.pack(uint40(a1.length * 32));
    }
    endGasReport();
    assertEq(packedCounter.total(), 1 * 32);

    startGasReport("pack 4 lengths into PackedCounter");
    unchecked {
      packedCounter = PackedCounterLib.pack(
        uint40(a1.length * 32),
        uint40(a2.length * 20),
        uint40(a3.length * 1),
        uint40(a4.length * 16)
      );
    }
    endGasReport();

    startGasReport("get total of PackedCounter");
    total = packedCounter.total();
    endGasReport();
    assertEq(packedCounter.total(), 1 * 32 + 2 * 20 + 3 * 1 + 4 * 16);
  }
}
