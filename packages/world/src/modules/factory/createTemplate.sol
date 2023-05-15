// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { FactoryContent } from "./tables/FactoryContent.sol";
import { FactoryIndex } from "./tables/FactoryIndex.sol";

/**
 * Create a template of default table values.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function createTemplate(bytes32 templateId, bytes32[] memory tableIds, bytes[] memory values) {
  FactoryIndex.set(templateId, tableIds);

  for (uint256 i; i < tableIds.length; i++) {
    FactoryContent.set(templateId, tableIds[i], values[i]);
  }
}

/**
 * Create a template of default table values.
 */
function createTemplate(IStore store, bytes32 templateId, bytes32[] memory tableIds, bytes[] memory values) {
  FactoryIndex.set(store, templateId, tableIds);

  for (uint256 i; i < tableIds.length; i++) {
    FactoryContent.set(store, templateId, tableIds[i], values[i]);
  }
}
