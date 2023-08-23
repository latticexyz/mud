// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Counter } from "codegen/Tables.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract OnchainClient {
  IWorld world;

  constructor(address world_) {
    world = IWorld(world_);
  }

  function readCounter() public view returns (uint32) {
    return Counter.get(world);
  }

  function add1() public {
    world.increment();
  }
}
