// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { PlayersAtPosition } from "../codegen/index.sol";
import { setPosition } from "./setPosition.sol";

contract MoveSystem is System {
  function move(int32 x, int32 y) public {
    address player = _msgSender();

    bool positionIsEmpty = PlayersAtPosition.length(x, y) == 0;

    require(positionIsEmpty, "another player is at this position");

    setPosition(player, x, y);
  }
}
