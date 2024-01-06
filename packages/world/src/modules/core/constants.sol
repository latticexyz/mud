// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { ROOT_NAMESPACE } from "../../constants.sol";
import { RESOURCE_SYSTEM } from "../../worldResourceTypes.sol";

/**
 * @dev Name of the core module.
 * @dev Represented as a bytes16 constant.
 */
bytes16 constant CORE_MODULE_NAME = bytes16("core");
bytes16 constant CORE_MODULE_2_NAME = bytes16("core2");

/**
 * @dev Resource ID for core system 1.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and a suffixed CORE_MODULE_NAME.
 */
ResourceId constant CORE_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("core1")))
);

/**
 * @dev Resource ID for core system 2.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and a suffixed CORE_MODULE_NAME.
 */
ResourceId constant CORE_SYSTEM_2_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("core2")))
);
