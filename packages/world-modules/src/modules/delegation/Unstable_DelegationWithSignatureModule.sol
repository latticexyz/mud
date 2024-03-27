// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { UserDelegationNonces } from "./tables/UserDelegationNonces.sol";
import { Unstable_DelegationWithSignatureSystem } from "./Unstable_DelegationWithSignatureSystem.sol";

import { DELEGATION_SYSTEM_ID } from "./constants.sol";

contract Unstable_DelegationWithSignatureModule is Module {
  Unstable_DelegationWithSignatureSystem private immutable delegationWithSignatureSystem =
    new Unstable_DelegationWithSignatureSystem();

  function installRoot(bytes memory encodedArgs) public {
    requireNotInstalled(__self, encodedArgs);

    IBaseWorld world = IBaseWorld(_world());

    // Register table
    UserDelegationNonces._register();

    // Register system
    (bool success, bytes memory data) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (DELEGATION_SYSTEM_ID, delegationWithSignatureSystem, true))
    );
    if (!success) revertWithBytes(data);

    // Register system's functions
    (success, data) = address(world).delegatecall(
      abi.encodeCall(
        world.registerRootFunctionSelector,
        (
          DELEGATION_SYSTEM_ID,
          "registerDelegationWithSignature(address,bytes32,bytes,address,bytes)",
          "registerDelegationWithSignature(address,bytes32,bytes,address,bytes)"
        )
      )
    );
    if (!success) revertWithBytes(data);
  }

  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }
}
