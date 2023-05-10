// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceType } from "../core/tables/ResourceType.sol";
import { Resource } from "../../Types.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { TemplateContent, TemplateContentTableId } from "./tables/TemplateContent.sol";
import { TemplateIndex, TemplateIndexTableId } from "./tables/TemplateIndex.sol";

contract TemplatesModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  function getName() public pure returns (bytes16) {
    return bytes16("templates");
  }

  function install(bytes memory) public override {
    IBaseWorld world = IBaseWorld(_world());

    if (ResourceType.get(TemplateContentTableId) == Resource.NONE) {
      // Register the tables
      world.registerTable(
        TemplateContentTableId.getNamespace(),
        TemplateContentTableId.getName(),
        TemplateContent.getSchema(),
        TemplateContent.getKeySchema()
      );
      world.registerTable(
        TemplateIndexTableId.getNamespace(),
        TemplateIndexTableId.getName(),
        TemplateIndex.getSchema(),
        TemplateIndex.getKeySchema()
      );

      // Register metadata for the tables
      (string memory tableName1, string[] memory fieldNames1) = TemplateContent.getMetadata();
      world.setMetadata(
        TemplateContentTableId.getNamespace(),
        TemplateContentTableId.getName(),
        tableName1,
        fieldNames1
      );
      (string memory tableName2, string[] memory fieldNames2) = TemplateIndex.getMetadata();
      world.setMetadata(TemplateIndexTableId.getNamespace(), TemplateIndexTableId.getName(), tableName2, fieldNames2);
    }
  }
}
