// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { Buildings, PlayerDonated } from "../codegen/index.sol";
import { BuildingType } from "../codegen/common.sol";

// This system is supposed to have a different namespace, but otherwise be identical to ChatSystem
contract BuildingsSystem is System {
  function contributeToBuilding(BuildingType _building, uint256[5] memory _resources) public {
    address player = _msgSender();
    bool isTeamRight = true;

    Buildings.set(_building, isTeamRight, _resources);
    PlayerDonated.set(0, player, isTeamRight, _building, _resources);
  }
}
