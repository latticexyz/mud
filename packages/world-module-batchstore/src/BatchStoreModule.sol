// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { worldRegistrationSystem } from "@latticexyz/world/src/codegen/experimental/systems/WorldRegistrationSystemLib.sol";

import { BatchStoreSystem } from "./BatchStoreSystem.sol";
import { batchStoreSystem } from "./codegen/experimental/systems/BatchStoreSystemLib.sol";

contract BatchStoreModule is Module {
  BatchStoreSystem private immutable systemAddress = new BatchStoreSystem();

  function installRoot(bytes memory encodedArgs) public override {
    ResourceId systemId = batchStoreSystem.toResourceId();

    if (!ResourceIds.getExists(systemId)) {
      worldRegistrationSystem.callAsRoot().registerSystem(systemId, systemAddress, true);
      // TODO: since this is a scary/internal and use-with-caution module/system, should we not register function selectors?
      worldRegistrationSystem.callAsRoot().registerRootFunctionSelector(
        systemId,
        "getTableRecords(bytes32,bytes32[][])",
        "getTableRecords(bytes32,bytes32[][])"
      );
      worldRegistrationSystem.callAsRoot().registerRootFunctionSelector(
        systemId,
        "setTableRecords(bytes32,(bytes32[],bytes,bytes32,bytes)[])",
        "setTableRecords(bytes32,(bytes32[],bytes,bytes32,bytes)[])"
      );
      worldRegistrationSystem.callAsRoot().registerRootFunctionSelector(
        systemId,
        "deleteTableRecords(bytes32,bytes32[][])",
        "deleteTableRecords(bytes32,bytes32[][])"
      );
    } else if (batchStoreSystem.getAddress() != address(systemAddress)) {
      // upgrade system
      worldRegistrationSystem.callAsRoot().registerSystem(systemId, systemAddress, true);
    }
  }
}
