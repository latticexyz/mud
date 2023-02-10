// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// @NOTE: DO NOT EDIT!
//        This file is a stub for LibDeploy.json to make imports work.
//        The real LibDeploy.json is generated automatically when deploying
//        via `mud deploy` or testing via `mud test`

import { World } from "solecs/World.sol";

struct DeployResult {
  World world;
  address deployer;
}

library LibDeploy {
  function deploy(
    address _deployer,
    address _world,
    bool _reuseComponents
  ) internal returns (DeployResult memory result) {}
}
