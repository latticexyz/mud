// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
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
    IBaseWorld world = IBaseWorld(_world());

    if (!ResourceIds.getExists(CrosschainRecordMetadata._tableId)) {
      CrosschainRecordMetadata.register();
    }

    ResourceId crosschainSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, ROOT_NAMESPACE, "CrosschainSystem");
    if (!ResourceIds.getExists(crosschainSystemId)) {
      (bool registrationSuccess, bytes memory registrationReturnData) = address(world).delegatecall(
        abi.encodeCall(world.registerSystem, (crosschainSystemId, crosschainSystem, true))
      );
      if (!registrationSuccess) revertWithBytes(registrationReturnData);
      // world.registerFunctionSelector(crosschainSystemId, "crosschainRead(bytes32,bytes32[])");
      // world.registerFunctionSelector(
      //   crosschainSystemId,
      //   "crosschainWrite((address,uint256,uint256,uint256,uint256),bytes)"
      // );
    }
  }

  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }
}
