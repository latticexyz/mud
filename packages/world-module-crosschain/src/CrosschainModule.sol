// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";

import { CrosschainSystem } from "./CrosschainSystem.sol";
import { CrosschainRecordMetadata } from "./codegen/tables/CrosschainRecordMetadata.sol";

contract CrosschainModule is Module {
  using WorldResourceIdInstance for ResourceId;

  CrosschainSystem private immutable crosschainSystem = new CrosschainSystem();

  function installRoot(bytes memory) public {
    if (!ResourceIds.getExists(CrosschainRecordMetadata._tableId)) {
      CrosschainRecordMetadata.register();
    }

    ResourceId crosschainSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, ROOT_NAMESPACE, "CrosschainSystem");
    if (!ResourceIds.getExists(crosschainSystemId)) {
      _registerSystem(crosschainSystemId, crosschainSystem);
      _registerRootFunctionSelector(crosschainSystemId, "crosschainRead(bytes32,bytes32[])");
      _registerRootFunctionSelector(
        crosschainSystemId,
        "crosschainWrite((address,uint256,uint256,uint256,uint256),bytes)"
      );
    }
  }

  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }

  function _registerSystem(ResourceId systemId, System system) internal {
    address world = _world();
    (bool success, bytes memory returnData) = world.delegatecall(
      abi.encodeCall(IBaseWorld(world).registerSystem, (systemId, system, true))
    );
    if (!success) revertWithBytes(returnData);
  }

  function _registerRootFunctionSelector(ResourceId systemId, string memory functionSignature) internal {
    address world = _world();
    (bool success, bytes memory returnData) = world.delegatecall(
      abi.encodeCall(IBaseWorld(world).registerRootFunctionSelector, (systemId, functionSignature, functionSignature))
    );

    if (!success) revertWithBytes(returnData);
  }
}
