// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { TemplateContent, TemplateIndex } from "../codegen/Tables.sol";

function createInstance(bytes32 templateId, bytes32[][] memory keys) {
  bytes32[] memory tableIds = TemplateIndex.get(templateId);

  for (uint256 i; i < tableIds.length; i++) {
    bytes memory value = TemplateContent.get(templateId, tableIds[i]);

    StoreSwitch.setRecord(tableIds[i], keys[i], value);
  }
}
