// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { TemplateContent, TemplateIndex } from "../Tables.sol";
import { Enum1, Enum2 } from "../Types.sol";
import { Statics, StaticsTableId, StaticsData } from "../tables/Statics.sol";
import { Counter, CounterTableId } from "../tables/Counter.sol";

bytes32 constant ID = "Example";
uint256 constant LENGTH = 2;

function ExampleTemplate() {
  bytes32[] memory tableIds = new bytes32[](LENGTH);
  tableIds[0] = StaticsTableId;
  tableIds[1] = CounterTableId;
  TemplateIndex.set(ID, tableIds);

  TemplateContent.set(
    ID,
    StaticsTableId,
    abi.encode(
      StaticsData({
        v1: 1,
        v2: 1,
        v3: "wasd",
        v4: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F,
        v5: true,
        v6: Enum1.E1,
        v7: Enum2.E1
      })
    )
  );
  TemplateContent.set(ID, CounterTableId, abi.encode(2));
}
