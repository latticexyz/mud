// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { NumberList, NumberListTableId } from "../codegen/Tables.sol";

contract NumberListSystem is System {
  function set(uint32[] memory list) public {
    NumberList.set(list);
  }

  function push(uint32 num) public {
    NumberList.push(num);
  }

  function pushRange(uint32 start, uint32 end) public {
    uint32[] memory list = new uint32[](end - start);
    for (uint32 i = start; i < end; i++) {
      list[i] = i;
    }

    bytes32[] memory emptyKey;
    StoreSwitch.pushToField(NumberListTableId, emptyKey, 0, EncodeArray.encode(list));
  }

  function pop() public {
    NumberList.pop();
  }
}
