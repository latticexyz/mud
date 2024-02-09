// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";

bytes14 constant NAMESPACE = bytes14("puppet");

ResourceId constant NAMESPACE_ID = ResourceId.wrap(bytes32(abi.encodePacked(RESOURCE_NAMESPACE, NAMESPACE)));

ResourceId constant PUPPET_DELEGATION = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, NAMESPACE, bytes16("Delegation")))
);

ResourceId constant PUPPET_FACTORY = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, NAMESPACE, bytes16("Factory")))
);

ResourceId constant PUPPET_TABLE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, NAMESPACE, bytes16("PuppetRegistry")))
);
