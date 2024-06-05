// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { Health } from "../codegen/game/tables/Health.sol";

contract game__HealSystem is System {
  function heal(address player) public {
    Health.set(player, Health.get(player) + 1);
  }
}
