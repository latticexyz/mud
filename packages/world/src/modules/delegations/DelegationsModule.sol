// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContextConsumer } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { DisposableDelegations } from "./tables/DisposableDelegations.sol";
import { DisposableDelegationControl } from "./DisposableDelegationControl.sol";

import { MODULE_NAME, NAMESPACE, DISPOSABLE_DELEGATION, DISPOSABLE_DELEGATION_ROOT, DISPOSABLE_DELEGATION_TABLE, DISPOSABLE_DELEGATION_TABLE_ROOT } from "./constants.sol";

/**
 * This module registers tables and delegation control systems required for standard delegations
 */
contract DelegationsModule is IModule, WorldContextConsumer {
  DisposableDelegationControl immutable disposableDelegationControl = new DisposableDelegationControl();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // If this module is installed as a root module, register it in the root namespace
    if (address(world) == address(this)) {
      DisposableDelegations.register(world, DISPOSABLE_DELEGATION_TABLE_ROOT);
      world.registerSystem(DISPOSABLE_DELEGATION_ROOT, disposableDelegationControl, true);
    } else {
      DisposableDelegations.register(world, DISPOSABLE_DELEGATION_TABLE);
      world.registerSystem(DISPOSABLE_DELEGATION, disposableDelegationControl, true);
    }
  }
}
