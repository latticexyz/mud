// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

contract AlphaSystem is System {
  function doOneThing() public {}
}

contract BetaSystem is System {
  function doAnotherThing() public {}
}
