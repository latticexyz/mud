// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { PackedCounter, PackedCounterLib } from "../src/PackedCounter.sol";

contract PackedCounterTest is Test, GasReporter {
  function testTotal() public returns (uint256 total) {
    startGasReport("pack uint40 array into PackedCounter");
    PackedCounter packedCounter = PackedCounterLib.pack(1, 2, 3, 4);
    endGasReport();

    startGasReport("get total of PackedCounter");
    total = packedCounter.total();
    endGasReport();

    assertEq(packedCounter.total(), 10);
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
}
