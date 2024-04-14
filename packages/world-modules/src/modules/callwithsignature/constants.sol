// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { RESOURCE_TABLE, RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "@latticexyz/world/src/worldResourceTypes.sol";

ResourceId constant DELEGATION_SYSTEM_ID = ResourceId.wrap(
  (bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, "Delegation")))
);
