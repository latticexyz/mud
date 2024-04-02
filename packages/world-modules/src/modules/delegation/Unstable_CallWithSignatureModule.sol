// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { CallWithSignatureNonces } from "./tables/CallWithSignatureNonces.sol";
import { Unstable_CallWithSignatureSystem } from "./Unstable_CallWithSignatureSystem.sol";

import { DELEGATION_SYSTEM_ID } from "./constants.sol";

contract Unstable_CallWithSignatureModule is Module {
  Unstable_CallWithSignatureSystem private immutable callWithSignatureSystem = new Unstable_CallWithSignatureSystem();

  function installRoot(bytes memory encodedArgs) public {
    requireNotInstalled(__self, encodedArgs);

    IBaseWorld world = IBaseWorld(_world());

    // Register table
    CallWithSignatureNonces._register();

    // Register system
    (bool success, bytes memory data) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (DELEGATION_SYSTEM_ID, callWithSignatureSystem, true))
    );
    if (!success) revertWithBytes(data);

    // Register system's functions
    (success, data) = address(world).delegatecall(
      abi.encodeCall(
        world.registerRootFunctionSelector,
        (
          DELEGATION_SYSTEM_ID,
          "callWithSignature(address,bytes32,bytes,bytes)",
          "callWithSignature(address,bytes32,bytes,bytes)"
        )
      )
    );
    if (!success) revertWithBytes(data);
  }

  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }
}
