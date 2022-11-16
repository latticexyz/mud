// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";

import { split } from "../utils.sol";

contract UtilsTest is DSTestPlus {
  function testSplit() public {
    uint32 first = 1;
    uint64 second = 2;

    // Pack data
    bytes memory packed = bytes.concat(bytes4(first), bytes8(second));

    // Unpack data
    uint8[] memory lengths = new uint8[](2);
    lengths[0] = 4;
    lengths[1] = 8;
    bytes[] memory unpacked = split(packed, lengths);

    assertEq(uint32(bytes4(unpacked[0])), first);
    assertEq(uint64(bytes8(unpacked[1])), second);
  }
}
