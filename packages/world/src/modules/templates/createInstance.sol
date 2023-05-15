// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { TemplateContent } from "./tables/TemplateContent.sol";
import { TemplateIndex } from "./tables/TemplateIndex.sol";

/**
 * Create an instance of a given template.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function createInstance(bytes32 templateId, bytes32[][] memory keys) {
  bytes32[] memory tableIds = TemplateIndex.get(templateId);

  for (uint256 i; i < tableIds.length; i++) {
    bytes memory value = TemplateContent.get(templateId, tableIds[i]);

    StoreSwitch.setRecord(tableIds[i], keys[i], value);
  }
}

/**
 * Create an instance of a given template.
 */
function createInstance(IStore store, bytes32 templateId, bytes32[][] memory keys) {
  bytes32[] memory tableIds = TemplateIndex.get(store, templateId);

  for (uint256 i; i < tableIds.length; i++) {
    bytes memory value = TemplateContent.get(store, templateId, tableIds[i]);

    store.setRecord(tableIds[i], keys[i], value);
  }
}
