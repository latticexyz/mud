// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Players } from "../src/codegen/index.sol";

contract PlayersTest is MudTest {
  IWorld world;

  function setUp() public override {
    super.setUp();
    world = IWorld(worldAddress);
  }

  function testPlayers(address alice) public {
    vm.startPrank(NamespaceOwner.get(ROOT_NAMESPACE_ID));

    uint256 aliceGold = 150;
    uint256[5] memory resources = [aliceGold, 0, 0, 0, 0];

    assertEq(Players.getItemResources(alice, 0), 0);
    assertEq(Players.getResources(alice)[0], 0);
    assertEq(resources[0], 150);

    Players.setResources(alice, resources);
    Players.setIsTeamRight(alice, true);

    assertEq(Players.getItemResources(alice, 0), 150);
    assertEq(Players.getResources(alice)[0], 150);
  }
}
