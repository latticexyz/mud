// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { revertWithBytes } from "../src/revertWithBytes.sol";

contract RevertWithBytesTest is Test {
  error SomeError(uint256 someValue, string someString);

  /// forge-config: default.allow_internal_expect_revert = true
  function testRegularRevert() public {
    vm.expectRevert(abi.encodeWithSelector(SomeError.selector, 1, "test"));
    revert SomeError(1, "test");
  }

  /// forge-config: default.allow_internal_expect_revert = true
  function testRevertWithBytes() public {
    vm.expectRevert(abi.encodeWithSelector(SomeError.selector, 1, "test"));
    revertWithBytes(abi.encodeWithSelector(SomeError.selector, 1, "test"));
  }
}
