// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";

bytes14 constant ROOT_NAMESPACE = "";
bytes16 constant ROOT_NAME = "";

ResourceId constant STORE_NAMESPACE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_NAMESPACE, bytes14("store"), ROOT_NAME))
);

ResourceId constant WORLD_NAMESPACE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_NAMESPACE, bytes14("world"), ROOT_NAME))
);

ResourceId constant ROOT_NAMESPACE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_NAMESPACE, ROOT_NAMESPACE, ROOT_NAME))
);

ResourceId constant UNLIMITED_DELEGATION = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("unlimited")))
);
