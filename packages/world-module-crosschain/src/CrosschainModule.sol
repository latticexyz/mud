// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorldRegistrationSystem } from "@latticexyz/world/src/codegen/interfaces/IWorldRegistrationSystem.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";

import { CrosschainSystem } from "./namespaces/root/CrosschainSystem.sol";
import { CrosschainRecord } from "./namespaces/crosschain/codegen/tables/CrosschainRecord.sol";

contract CrosschainModule is Module {
  using WorldResourceIdInstance for ResourceId;

  CrosschainSystem private immutable crosschainSystem = new CrosschainSystem();

  function installRoot(bytes memory) public {
    if (!ResourceIds.getExists(CrosschainRecord._tableId)) {
      CrosschainRecord.register();
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
    (bool success, bytes memory returnData) = _world().delegatecall(
      abi.encodeCall(IWorldRegistrationSystem.registerSystem, (systemId, system, true))
    );
    if (!success) revertWithBytes(returnData);
  }

  function _registerRootFunctionSelector(ResourceId systemId, string memory functionSignature) internal {
    (bool success, bytes memory returnData) = _world().delegatecall(
      abi.encodeCall(
        IWorldRegistrationSystem.registerRootFunctionSelector,
        (systemId, functionSignature, functionSignature)
      )
    );

    if (!success) revertWithBytes(returnData);
  }
}
