// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import { System } from "@latticexyz/world/src/System.sol";

abstract contract SomeAbstractProgram is System {
  function abstractExecute() public {}
}
