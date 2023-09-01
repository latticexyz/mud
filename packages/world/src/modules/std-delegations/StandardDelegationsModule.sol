// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContextConsumer } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { CallboundDelegationControl } from "./CallboundDelegationControl.sol";
import { TimeboundDelegationControl } from "./TimeboundDelegationControl.sol";
import { MODULE_NAME, CALLBOUND_DELEGATION, TIMEBOUND_DELEGATION } from "./constants.sol";

import { CallboundDelegations } from "./tables/CallboundDelegations.sol";
import { TimeboundDelegations } from "./tables/TimeboundDelegations.sol";

/**
 * This module registers tables and delegation control systems required for standard delegations
 */
contract StandardDelegationsModule is IModule, WorldContextConsumer {
  CallboundDelegationControl private immutable callboundDelegationControl = new CallboundDelegationControl();
  TimeboundDelegationControl private immutable timeboundDelegationControl = new TimeboundDelegationControl();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register tables
    CallboundDelegations.register(world);
    TimeboundDelegations.register(world);

    // Register systems
    world.registerSystem(CALLBOUND_DELEGATION, callboundDelegationControl, true);
    world.registerSystem(TIMEBOUND_DELEGATION, timeboundDelegationControl, true);
  }
}
