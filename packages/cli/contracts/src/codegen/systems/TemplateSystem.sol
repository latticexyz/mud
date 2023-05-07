// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";
import { ExampleTemplate } from "../templates/ExampleTemplate.sol";

contract PrototypeSystem is System {
  function createPrototypes() public {
    ExampleTemplate();
  }
}
