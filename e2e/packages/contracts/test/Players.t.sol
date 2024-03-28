// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreErrors } from "@latticexyz/store/src/IStoreErrors.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { Players } from "../src/codegen/index.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

contract PlayersTest is MudTest {
  function testPlayers(address player) public {
    assertEq(Players.lengthResources, 5);
    assertEq(Players.getResources(player).length, 5);
    assertEq(Players.getResources(player)[0], 0);

    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 0));

    assertEq(Players.getItemResources(player, 0), 0);
  }
}
