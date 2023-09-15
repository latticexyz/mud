// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { Module } from "../../Module.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { BatchCallSystem } from "./BatchCallSystem.sol";

import { NAMESPACE, MODULE_NAME, SYSTEM_NAME } from "./constants.sol";

contract BatchCallModule is Module {
  BatchCallSystem private immutable batchCallSystem = new BatchCallSystem();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function installRoot(bytes memory args) public {
    install(args);
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    world.registerSystem(ResourceSelector.from(NAMESPACE, SYSTEM_NAME), batchCallSystem, true);

    world.registerFunctionSelector(ResourceSelector.from(NAMESPACE, SYSTEM_NAME), "batchCall", "(bytes32[],bytes[])");
  }
}
