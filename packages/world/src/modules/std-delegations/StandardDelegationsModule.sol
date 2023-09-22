// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { Module } from "../../Module.sol";
import { WorldContextConsumer } from "../../WorldContext.sol";
import { revertWithBytes } from "../../revertWithBytes.sol";

import { CallboundDelegationControl } from "./CallboundDelegationControl.sol";
import { TimeboundDelegationControl } from "./TimeboundDelegationControl.sol";
import { MODULE_NAME, CALLBOUND_DELEGATION, TIMEBOUND_DELEGATION } from "./constants.sol";

import { CallboundDelegations } from "./tables/CallboundDelegations.sol";
import { TimeboundDelegations } from "./tables/TimeboundDelegations.sol";

/**
 * This module registers tables and delegation control systems required for standard delegations
 */
contract StandardDelegationsModule is Module {
  CallboundDelegationControl private immutable callboundDelegationControl = new CallboundDelegationControl();
  TimeboundDelegationControl private immutable timeboundDelegationControl = new TimeboundDelegationControl();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function installRoot(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register tables
    CallboundDelegations.register();
    TimeboundDelegations.register();

    // Register systems
    (bool success, bytes memory returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (CALLBOUND_DELEGATION, callboundDelegationControl, true))
    );
    if (!success) revertWithBytes(returnData);

    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (TIMEBOUND_DELEGATION, timeboundDelegationControl, true))
    );
    if (!success) revertWithBytes(returnData);
  }

  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }
}
