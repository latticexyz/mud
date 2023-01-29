// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { PackedCounter, PackedCounter_ } from "../PackedCounter.sol";

contract PackedCounterTest is DSTestPlus {
  function testTotal() public {
    uint16[] memory counters = new uint16[](4);
    counters[0] = 1;
    counters[1] = 2;
    counters[2] = 3;
    counters[3] = 4;

    uint256 gas = gasleft();
    PackedCounter packedCounter = PackedCounter_.pack(counters);

    gas = gas - gasleft();
    console.log("gas used (pack): %s", gas);

    gas = gasleft();
    packedCounter.total();
    gas = gas - gasleft();
    console.log("gas used (total): %s", gas);

    assertEq(packedCounter.total(), 10);
  }

  function testAtIndex() public {
    uint16[] memory counters = new uint16[](4);
    counters[0] = 1;
    counters[1] = 2;
    counters[2] = 3;
    counters[3] = 4;

    uint256 gas = gasleft();
    PackedCounter packedCounter = PackedCounter_.pack(counters);

    gas = gas - gasleft();
    console.log("gas used (pack): %s", gas);

    gas = gasleft();
    packedCounter.atIndex(3);
    gas = gas - gasleft();
    console.log("gas used (at index): %s", gas);

    assertEq(packedCounter.atIndex(0), 1);
    assertEq(packedCounter.atIndex(1), 2);
    assertEq(packedCounter.atIndex(2), 3);
    assertEq(packedCounter.atIndex(3), 4);
  }

  function testSetAtIndex() public {
    uint16[] memory counters = new uint16[](4);
    counters[0] = 1;
    counters[1] = 2;
    counters[2] = 3;
    counters[3] = 4;

    PackedCounter packedCounter = PackedCounter_.pack(counters);

    uint256 gas = gasleft();
    packedCounter = packedCounter.setAtIndex(2, 5);
    gas = gas - gasleft();
    console.log("gas used (at index): %s", gas);

    assertEq(packedCounter.atIndex(0), 1);
    assertEq(packedCounter.atIndex(1), 2);
    assertEq(packedCounter.atIndex(2), 5);
    assertEq(packedCounter.atIndex(3), 4);
    assertEq(packedCounter.total(), 12);
  }
}
