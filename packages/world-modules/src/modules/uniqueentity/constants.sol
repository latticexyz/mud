// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_TABLE, RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "@latticexyz/world/src/worldResourceTypes.sol";

bytes14 constant NAMESPACE = bytes14("uniqueEntity");
bytes16 constant SYSTEM_NAME = bytes16("system");
bytes16 constant TABLE_NAME = bytes16("table");

ResourceId constant NAMESPACE_ID = ResourceId.wrap(bytes32(abi.encodePacked(RESOURCE_NAMESPACE, NAMESPACE)));
ResourceId constant TABLE_ID = ResourceId.wrap(bytes32(abi.encodePacked(RESOURCE_TABLE, NAMESPACE, TABLE_NAME)));
ResourceId constant SYSTEM_ID = ResourceId.wrap((bytes32(abi.encodePacked(RESOURCE_SYSTEM, NAMESPACE, SYSTEM_NAME))));
