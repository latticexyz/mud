// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { UNLIMITED_DELEGATION } from "./constants.sol";
import { IDelegationControl } from "./IDelegationControl.sol";
import { SystemCall } from "./SystemCall.sol";

library Delegation {
  function exists(ResourceId delegationControlId) internal pure returns (bool) {
    return ResourceId.unwrap(delegationControlId) != bytes32("");
  }

  function isUnlimited(ResourceId delegationControlId) internal pure returns (bool) {
    return ResourceId.unwrap(delegationControlId) == ResourceId.unwrap(UNLIMITED_DELEGATION);
  }

  function isLimited(ResourceId delegationControlId) internal pure returns (bool) {
    return exists(delegationControlId) && !isUnlimited(delegationControlId);
  }

  /**
   * Verify a delegation.
   * Returns true if the delegation exists and is valid, false otherwise.
   * Note: verifying the delegation might have side effects in the delegation control contract.
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
