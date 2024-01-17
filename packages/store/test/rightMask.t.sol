// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { rightMask } from "../src/rightMask.sol";

contract RightMaskTest is Test, GasReporter {
  function testRightMask() public {
    bytes32 mask;
    assertEq(rightMask(0), type(uint256).max);
    bytes32 highByte = hex"ff";
    for (uint256 i = 1; i <= 32; i++) {
      mask |= highByte;
      highByte >>= 8;
      assertEq(rightMask(i), type(uint256).max - uint256(mask));
    }
  }

  function testFuzzRightMaskOver32(uint256 byteLength) public {
    // for values >32 the mask must always be 0
    vm.assume(byteLength > 32);
    assertEq(rightMask(byteLength), 0);
  }

  function testRightMaskOver32() public {
    // manually test for underflow issues
    for (uint256 i; i < 100; i++) {
      assertEq(rightMask(type(uint256).max - i), 0);
    }
    for (uint256 i; i < 100; i++) {
      assertEq(rightMask((type(uint256).max >> 8) + 50 - i), 0);
    }
  }
}
