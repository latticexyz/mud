// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { leftMask } from "../src/utils.sol";

contract UtilsTest is Test, GasReporter {
  function testLeftMask() public {
    bytes32 mask;
    assertEq(leftMask(0), uint256(mask));
    bytes32 highByte = hex"ff";
    for (uint256 i = 1; i <= 32; i++) {
      mask |= highByte;
      highByte >>= 8;
      assertEq(leftMask(i), uint256(mask));
    }
  }

  function testFuzzLeftMaskOver32(uint256 byteLength) public {
    // for values >32 the mask must always be type(uint256).max
    vm.assume(byteLength > 32);
    assertEq(leftMask(byteLength), type(uint256).max);
  }

  function testLeftMaskOver32() public {
    // manually test for overflow issues
    for (uint256 i; i < 100; i++) {
      assertEq(leftMask(type(uint256).max - i), type(uint256).max);
    }
    for (uint256 i; i < 100; i++) {
      assertEq(leftMask((type(uint256).max >> 8) + 50 - i), type(uint256).max);
    }
  }
}
