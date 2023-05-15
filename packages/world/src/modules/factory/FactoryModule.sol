// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceType } from "../core/tables/ResourceType.sol";
import { Resource } from "../../Types.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { FactoryContent, FactoryContentTableId } from "./tables/FactoryContent.sol";
import { FactoryIndex, FactoryIndexTableId } from "./tables/FactoryIndex.sol";

contract FactoryModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  function getName() public pure returns (bytes16) {
    return bytes16("factory");
  }

  function install(bytes memory) public override {
    IBaseWorld world = IBaseWorld(_world());

    if (ResourceType.get(FactoryContentTableId) == Resource.NONE) {
      // Register the tables
      world.registerTable(
        FactoryContentTableId.getNamespace(),
        FactoryContentTableId.getName(),
        FactoryContent.getSchema(),
        FactoryContent.getKeySchema()
      );
      world.registerTable(
        FactoryIndexTableId.getNamespace(),
        FactoryIndexTableId.getName(),
        FactoryIndex.getSchema(),
        FactoryIndex.getKeySchema()
      );

      // Register metadata for the tables
      (string memory tableName1, string[] memory fieldNames1) = FactoryContent.getMetadata();
      world.setMetadata(FactoryContentTableId.getNamespace(), FactoryContentTableId.getName(), tableName1, fieldNames1);
      (string memory tableName2, string[] memory fieldNames2) = FactoryIndex.getMetadata();
      world.setMetadata(FactoryIndexTableId.getNamespace(), FactoryIndexTableId.getName(), tableName2, fieldNames2);
    }
  }
}
