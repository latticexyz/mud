// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { BattleResult } from "../codegen/index.sol";

contract BattleResultSystem is System {
  function setBattleResult(bytes32 battleId, bytes32[] memory aggressorAllies, bytes32[] memory targetAllies) public {
    BattleResult.set(
      battleId,
      bytes32(0),
      0,
      bytes32(0),
      0,
      bytes32(0),
      bytes32(0),
      bytes32(0),
      bytes32(0),
      0,
      aggressorAllies,
      targetAllies
    );
  }
}
