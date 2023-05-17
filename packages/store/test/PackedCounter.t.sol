// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { PackedCounter, PackedCounterLib } from "../src/PackedCounter.sol";

contract PackedCounterTest is Test {
  function testTotal() public {
    uint40[] memory counters = new uint40[](4);
    counters[0] = 1;
    counters[1] = 2;
    counters[2] = 3;
    counters[3] = 4;

    // !gasreport pack uint40 array into PackedCounter
    PackedCounter packedCounter = PackedCounterLib.pack(counters);

    // !gasreport get total of PackedCounter
    packedCounter.total();

    assertEq(packedCounter.total(), 10);
  }

  function testAtIndex() public {
    uint40[] memory counters = new uint40[](4);
    counters[0] = 1;
    counters[1] = 2;
    counters[2] = 3;
    counters[3] = 4;

    PackedCounter packedCounter = PackedCounterLib.pack(counters);

    // !gasreport get value at index of PackedCounter
    packedCounter.atIndex(3);

    assertEq(packedCounter.atIndex(0), 1);
    assertEq(packedCounter.atIndex(1), 2);
    assertEq(packedCounter.atIndex(2), 3);
    assertEq(packedCounter.atIndex(3), 4);
  }

  function testSetAtIndex() public {
    uint40[] memory counters = new uint40[](4);
    counters[0] = 1;
    counters[1] = 2;
    counters[2] = 3;
    counters[3] = 4;

    PackedCounter packedCounter = PackedCounterLib.pack(counters);

    // !gasreport set value at index of PackedCounter
    packedCounter = packedCounter.setAtIndex(2, 5);

    assertEq(packedCounter.atIndex(0), 1);
    assertEq(packedCounter.atIndex(1), 2);
    assertEq(packedCounter.atIndex(2), 5);
    assertEq(packedCounter.atIndex(3), 4);
    assertEq(packedCounter.total(), 12);
  }
}
