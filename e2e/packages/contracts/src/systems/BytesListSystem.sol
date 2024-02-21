// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { BytesList } from "../codegen/index.sol";

contract BytesListSystem is System {
  function pushBytes(bytes32 b) public {
    BytesList.push(b);
  }
}
