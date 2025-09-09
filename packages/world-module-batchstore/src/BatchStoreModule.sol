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

    if (batchStoreSystem.getAddress() != address(systemAddress)) {
      // install or upgrade system
      worldRegistrationSystem.callAsRoot().registerSystem(systemId, systemAddress, true);
    }
  }
}
