// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreErrors } from "@latticexyz/store/src/IStoreErrors.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { StaticArray } from "../src/codegen/index.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

contract StaticArrayLengthTest is MudTest {
  function testLength() public {
    assertEq(StaticArray.lengthValue, 3);
    assertEq(StaticArray.getValue().length, 3);

    assertEq(StaticArray.getValue()[0], 0);
    assertEq(StaticArray.getItemValue(0), 0);

    assertEq(StaticArray.getValue()[1], 0);
    assertEq(StaticArray.getItemValue(1), 0);

    assertEq(StaticArray.getValue()[2], 0);
    assertEq(StaticArray.getItemValue(2), 0);

    // FIXME: this does not revert
    vm.expectRevert();
    StaticArray.getItemValue(3);
  }
}
