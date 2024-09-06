// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { World } from "@latticexyz/world/src/World.sol";

contract CustomWorld is World {
  function helloWorld() view returns (string) {
    return "Hello world!";
  }
}
