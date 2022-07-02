// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { LibDiamond, DiamondStorage } from "../diamond/libraries/LibDiamond.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";

contract EmberFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

  function world() external view returns (address) {
    return address(s.world);
  }

  function configureWorld() public {
    GameConfigComponent gameConfigComponent = GameConfigComponent(s.world.getComponent(GameConfigComponentID));
    gameConfigComponent.set(GodID, GameConfig({ startTime: block.timestamp, turnLength: uint256(20) }));
  }
}
