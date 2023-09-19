// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";

bytes14 constant ROOT_NAMESPACE = 0;
bytes16 constant ROOT_NAME = 0;
bytes32 constant ROOT_NAMESPACE_ID = bytes32(abi.encodePacked(ROOT_NAMESPACE, ROOT_NAME, RESOURCE_NAMESPACE));

bytes32 constant UNLIMITED_DELEGATION = bytes32(
  abi.encodePacked(ROOT_NAMESPACE, bytes16("unlimited"), RESOURCE_SYSTEM)
);
