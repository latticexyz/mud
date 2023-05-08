// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { TemplateContent, TemplateIndex } from "../Tables.sol";
import { Enum1, Enum2 } from "../Types.sol";
import { Counter, CounterTableId } from "../tables/Counter.sol";

bytes32 constant templateId = "Person";
bytes32 constant PersonTemplateId = templateId;
uint256 constant LENGTH = 1;

function PersonTemplate() {
  bytes32[] memory tableIds = new bytes32[](LENGTH);
  tableIds[0] = CounterTableId;
  TemplateIndex.set(templateId, tableIds);

  TemplateContent.set(templateId, CounterTableId, Counter.encode(123456789));
}
