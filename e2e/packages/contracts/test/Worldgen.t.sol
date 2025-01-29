// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { ICustomErrorsSystem } from "../src/codegen/world/ICustomErrorsSystem.sol";
import { Position } from "../src/CustomTypes.sol";

contract WorldgenTest is MudTest {
  /// forge-config: default.allow_internal_expect_revert = true
  function testError1WasGenerated() public {
    vm.expectRevert();
    revert ICustomErrorsSystem.TestError1();
  }

  /// forge-config: default.allow_internal_expect_revert = true
  function testError2WasGenerated() public {
    vm.expectRevert();
    revert ICustomErrorsSystem.TestError2(Position({ x: -1, y: 1 }), uint256(123), string("name"), true);
  }
}
