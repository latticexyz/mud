// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// NOTE:  THIS IS A STUB TO MAKE IMPORTS WORK.
//        The real LibDeploy.sol is generated automatically
//        when calling `mud test` or `mud deploy-contracts`.
//        To manually generate the real LibDeploy.sol use
//        `mud codegen-libdeploy`.

import { IWorld } from "solecs/interfaces/IWorld.sol";

struct DeployResult {
  IWorld world;
  address deployer;
}

library LibDeploy {
  function deploy(
    address _deployer,
    address _world,
    bool _reuseComponents
  ) internal returns (DeployResult memory result) {}
}
