// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { Victory } from "./codegen/tables/Victory.sol";

contract VictorySystem is System {
  function win() public {
    Victory.set(true);
  }
}
