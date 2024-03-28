// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreErrors } from "@latticexyz/store/src/IStoreErrors.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { StaticArray } from "../src/codegen/index.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

contract PlayersTest is MudTest {
  function testPlayers() public {
    assertEq(StaticArray.lengthValue, 3);
    assertEq(StaticArray.getValue().length, 3);
    assertEq(StaticArray.getValue()[0], 0);

    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 0));
    assertEq(StaticArray.getItemValue(0), 0);
  }
}
