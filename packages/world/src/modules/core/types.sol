// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

struct SystemCallData {
  ResourceId systemId;
  bytes callData;
}
