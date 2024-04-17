// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { StoreMock } from "@latticexyz/store/test/StoreMock.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { Players } from "../src/codegen/index.sol";

contract PlayersTest is Test, StoreMock {
  function testPlayers(address alice) public {
    Players.register();

    uint256 aliceGold = 150;
    uint256[5] memory resources = [aliceGold, 0, 0, 0, 0];

    assertEq(Players.getItemResources(alice, 0), 0);
    assertEq(Players.getResources(alice)[0], 0);
    assertEq(resources[0], 150);

    Players.setResources(alice, resources);
    Players.setIsTeamRight(alice, true);

    assertEq(Players.getItemResources(alice, 0), 150);
    assertEq(Players.getResources(alice)[0], 150);

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = bytes32(uint256(uint160(alice)));
    assertEq(StoreSwitch.getDynamicFieldLength(Players._tableId, _keyTuple, 2), 160);
  }
}
