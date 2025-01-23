// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { ROOT_NAMESPACE } from "../../constants.sol";
import { RESOURCE_SYSTEM } from "../../worldResourceTypes.sol";

/**
 * @dev Resource ID for access management system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and the system name.
 */
ResourceId constant ACCESS_MANAGEMENT_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("AccessManagement")))
);

/**
 * @dev Resource ID for balance transfer system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and the system name.
 */
ResourceId constant BALANCE_TRANSFER_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("BalanceTransfer")))
);

/**
 * @dev Resource ID for batch call system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and the system name.
 */
ResourceId constant BATCH_CALL_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("BatchCall")))
);

/**
 * @dev Resource ID for core registration system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and the system name.
 */
ResourceId constant REGISTRATION_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("Registration")))
);

/**
 * @dev Resource ID for the call with signature system.
 * @dev This ID is derived from the RESOURCE_SYSTEM type, the ROOT_NAMESPACE, and the system name.
 */
ResourceId constant CALL_WITH_SIGNATURE_SYSTEM_ID = ResourceId.wrap(
  (bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("CallWithSignatur"))))
);
