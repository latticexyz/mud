// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { Module } from "../../Module.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";
import { revertWithBytes } from "../../revertWithBytes.sol";
import { ROOT_NAMESPACE } from "../../constants.sol";

import { BatchCallRootSystem } from "./BatchCallRootSystem.sol";
import { MODULE_NAME, SYSTEM_NAME } from "./constants.sol";

contract BatchCallRootModule is Module {
  BatchCallRootSystem private immutable batchCallRootSystem = new BatchCallRootSystem();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function installRoot(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    (bool success, bytes memory returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerSystem,
        (ResourceSelector.from(ROOT_NAMESPACE, SYSTEM_NAME), batchCallRootSystem, true)
      )
    );
    if (!success) revertWithBytes(returnData);

    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerRootFunctionSelector,
        (
          ResourceSelector.from(ROOT_NAMESPACE, SYSTEM_NAME),
          BatchCallRootSystem.batchCall.selector,
          BatchCallRootSystem.batchCall.selector
        )
      )
    );
    if (!success) revertWithBytes(returnData);
  }

  function install(bytes memory) public pure {
    revert NonRootInstallNotSupported();
  }
}
