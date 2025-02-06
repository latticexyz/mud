// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { CallboundDelegationControl } from "./CallboundDelegationControl.sol";
import { SystemboundDelegationControl } from "./SystemboundDelegationControl.sol";
import { TimeboundDelegationControl } from "./TimeboundDelegationControl.sol";
import { CALLBOUND_DELEGATION, SYSTEMBOUND_DELEGATION, TIMEBOUND_DELEGATION } from "./constants.sol";

import { CallboundDelegations } from "./tables/CallboundDelegations.sol";
import { SystemboundDelegations } from "./tables/SystemboundDelegations.sol";
import { TimeboundDelegations } from "./tables/TimeboundDelegations.sol";

/**
 * This module registers tables and delegation control systems required for standard delegations
 */
contract StandardDelegationsModule is Module {
  CallboundDelegationControl private immutable callboundDelegationControl = new CallboundDelegationControl();
  SystemboundDelegationControl private immutable systemboundDelegationControl = new SystemboundDelegationControl();
  TimeboundDelegationControl private immutable timeboundDelegationControl = new TimeboundDelegationControl();

  function installRoot(bytes memory) public override {
    IBaseWorld world = IBaseWorld(_world());

    // Register tables
    CallboundDelegations.register();
    SystemboundDelegations.register();
    TimeboundDelegations.register();

    // Register systems
    (bool success, bytes memory returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (CALLBOUND_DELEGATION, callboundDelegationControl, true))
    );
    if (!success) revertWithBytes(returnData);

    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (SYSTEMBOUND_DELEGATION, systemboundDelegationControl, true))
    );
    if (!success) revertWithBytes(returnData);

    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (TIMEBOUND_DELEGATION, timeboundDelegationControl, true))
    );
    if (!success) revertWithBytes(returnData);
  }
}
