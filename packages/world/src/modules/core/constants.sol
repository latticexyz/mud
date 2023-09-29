// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { ROOT_NAMESPACE } from "../../constants.sol";
import { RESOURCE_SYSTEM } from "../../worldResourceTypes.sol";

bytes16 constant CORE_MODULE_NAME = bytes16("core");

ResourceId constant CORE_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, CORE_MODULE_NAME))
);
