// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";

bytes16 constant MODULE_NAME = bytes16("puppet");
bytes14 constant NAMESPACE = bytes14("puppet");

ResourceId constant PUPPET_DELEGATION = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, NAMESPACE, bytes16("Delegation")))
);

ResourceId constant PUPPET_FACTORY = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, NAMESPACE, bytes16("Factory")))
);

ResourceId constant PUPPET_TABLE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, NAMESPACE, bytes16("PuppetRegistry")))
);
