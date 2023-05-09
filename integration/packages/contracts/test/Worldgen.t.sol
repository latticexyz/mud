// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";

import { IErrorTestSystem } from "../src/codegen/world/IErrorTestSystem.sol";
import { Position } from "../src/CustomTypes.sol";

contract WorldgenTest is MudV2Test {
  function testError1WasGenerated() public {
    vm.expectRevert();
    revert IErrorTestSystem.TestError1();
  }

  function testError2WasGenerated() public {
    vm.expectRevert();
    revert IErrorTestSystem.TestError2(Position({ x: -1, y: 1 }), uint256(123), string("name"), true);
  }
}
