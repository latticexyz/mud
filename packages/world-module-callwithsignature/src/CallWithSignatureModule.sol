// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { CallWithSignatureNonces } from "./codegen/tables/CallWithSignatureNonces.sol";
import { CallWithSignatureSystem } from "./CallWithSignatureSystem.sol";

import { DELEGATION_SYSTEM_ID } from "./constants.sol";

contract CallWithSignatureModule is Module {
  CallWithSignatureSystem private immutable callWithSignatureSystem = new CallWithSignatureSystem();

  function installRoot(bytes memory encodedArgs) public override {
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
}
