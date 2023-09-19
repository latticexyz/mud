// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";

bytes14 constant ROOT_NAMESPACE = "";
bytes16 constant ROOT_NAME = "";

ResourceId constant ROOT_NAMESPACE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(ROOT_NAMESPACE, ROOT_NAME, RESOURCE_NAMESPACE))
);

ResourceId constant UNLIMITED_DELEGATION = ResourceId.wrap(
  bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("unlimited"), RESOURCE_SYSTEM))
);
