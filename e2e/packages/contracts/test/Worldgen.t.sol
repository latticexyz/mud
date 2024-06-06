// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { ICustomErrorsSyst } from "../src/codegen/world/ICustomErrorsSyst.sol";
import { Position } from "../src/CustomTypes.sol";

contract WorldgenTest is MudTest {
  function testError1WasGenerated() public {
    vm.expectRevert();
    revert ICustomErrorsSyst.TestError1();
  }

  function testError2WasGenerated() public {
    vm.expectRevert();
    revert ICustomErrorsSyst.TestError2(Position({ x: -1, y: 1 }), uint256(123), string("name"), true);
  }
}
