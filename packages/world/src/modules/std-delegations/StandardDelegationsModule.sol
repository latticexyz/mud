// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContextConsumer } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { DisposableDelegationControl } from "./DisposableDelegationControl.sol";
import { TimeboundDelegationControl } from "./TimeboundDelegationControl.sol";
import { MODULE_NAME, DISPOSABLE_DELEGATION, TIMEBOUND_DELEGATION } from "./constants.sol";

import { DisposableDelegations } from "./tables/DisposableDelegations.sol";
import { TimeboundDelegations } from "./tables/TimeboundDelegations.sol";

/**
 * This module registers tables and delegation control systems required for standard delegations
 */
contract StandardDelegationsModule is IModule, WorldContextConsumer {
  DisposableDelegationControl private immutable disposableDelegationControl = new DisposableDelegationControl();
  TimeboundDelegationControl private immutable timeboundDelegationControl = new TimeboundDelegationControl();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register tables
    DisposableDelegations.register(world);
    TimeboundDelegations.register(world);

    // Register systems
    world.registerSystem(DISPOSABLE_DELEGATION, disposableDelegationControl, true);
    world.registerSystem(TIMEBOUND_DELEGATION, timeboundDelegationControl, true);
  }
}
