// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Players } from "../src/codegen/index.sol";

contract PlayersMudTest is MudTest {
  function testPlayers(address alice) public {
    uint256 aliceGold = 150;
    uint256[5] memory resources = [aliceGold, 0, 0, 0, 0];

    vm.prank(NamespaceOwner.get(ROOT_NAMESPACE_ID));
    Players.setResources(alice, resources);

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = bytes32(uint256(uint160(alice)));
    assertEq(StoreSwitch.getDynamicFieldLength(Players._tableId, _keyTuple, 2), 160);
  }
}
