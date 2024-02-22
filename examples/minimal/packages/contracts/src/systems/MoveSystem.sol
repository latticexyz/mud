// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { getKeysWithValue } from "@latticexyz/world-modules/src/modules/keyswithvalue/getKeysWithValue.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { Position, PositionTableId } from "../codegen/index.sol";

contract MoveSystem is System {
  function move(int32 x, int32 y) public {
    address player = _msgSender();

    (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Position.encode(x, y);
    bool positionIsEmpty = getKeysWithValue(PositionTableId, staticData, encodedLengths, dynamicData).length == 0;

    require(positionIsEmpty, "another player is at this position");

    Position.set(player, x, y);
  }
}
