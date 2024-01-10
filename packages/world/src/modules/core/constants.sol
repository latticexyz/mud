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

/**
 * @dev Resource ID for access management system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and a suffixed CORE_MODULE_NAME.
 */
ResourceId constant ACCESS_MANAGEMENT_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("AccessManagement")))
);

/**
 * @dev Resource ID for balance transfer system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and a suffixed CORE_MODULE_NAME.
 */
ResourceId constant BALANCE_TRANSFER_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("BalanceTransfer")))
);

/**
 * @dev Resource ID for batch call system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and a suffixed CORE_MODULE_NAME.
 */
ResourceId constant BATCH_CALL_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("BatchCall")))
);

/**
 * @dev Resource ID for core registration system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and a suffixed CORE_MODULE_NAME.
 */
ResourceId constant CORE_REGISTRATION_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("CoreRegistration")))
);
