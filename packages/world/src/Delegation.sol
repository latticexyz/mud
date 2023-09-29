// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { UNLIMITED_DELEGATION } from "./constants.sol";
import { IDelegationControl } from "./IDelegationControl.sol";
import { SystemCall } from "./SystemCall.sol";

/**
 * @title Delegation
 * @dev Library for managing and verifying delegations.
 */
library Delegation {
  /**
   * @dev Check if a delegation control ID exists by comparing it to an empty `bytes32` value.
   * @param delegationControlId The ResourceId of the delegation control.
   * @return true if the delegation control ID exists, false otherwise.
   */
  function exists(ResourceId delegationControlId) internal pure returns (bool) {
    return ResourceId.unwrap(delegationControlId) != bytes32("");
  }

  /**
   * @dev Check if a delegation is unlimited by comparing it to the constant for unlimited delegations.
   * @param delegationControlId The ResourceId of the delegation control.
   * @return true if the delegation is unlimited, false otherwise.
   */
  function isUnlimited(ResourceId delegationControlId) internal pure returns (bool) {
    return ResourceId.unwrap(delegationControlId) == ResourceId.unwrap(UNLIMITED_DELEGATION);
  }

  /**
   * @dev Check if a delegation is limited.
   * @param delegationControlId The ResourceId of the delegation control.
   * @return true if the delegation is limited, false otherwise.
   */
  function isLimited(ResourceId delegationControlId) internal pure returns (bool) {
    return exists(delegationControlId) && !isUnlimited(delegationControlId);
  }

  /**
   * @notice Verify a delegation.
   * @dev Verifying the delegation might have side effects in the delegation control contract.
   * @param delegationControlId The ResourceId of the delegation control.
   * @param delegator The address of the delegator.
   * @param delegatee The address of the delegatee.
   * @param systemId The ResourceId of the system.
   * @param callData The call data of the call that is being delegated.
   * @return true if the delegation is exists and is valid, false otherwise.
   */
  function verify(
    ResourceId delegationControlId,
    address delegator,
    address delegatee,
    ResourceId systemId,
    bytes memory callData
  ) internal returns (bool) {
    // Early return if there is an unlimited delegation
    if (isUnlimited(delegationControlId)) return true;

    // Early return if there is no valid delegation
    if (!exists(delegationControlId)) return false;

    // Call the delegation control contract to check if the delegator has granted access to the delegatee
    (bool success, bytes memory data) = SystemCall.call({
      caller: delegatee,
      systemId: delegationControlId,
      callData: abi.encodeCall(IDelegationControl.verify, (delegator, systemId, callData)),
      value: 0
    });

    if (!success) return false;
    return abi.decode(data, (bool));
  }
}
