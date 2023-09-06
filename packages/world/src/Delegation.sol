// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { UNLIMITED_DELEGATION } from "./constants.sol";
import { IDelegationControl } from "./interfaces/IDelegationControl.sol";
import { SystemCall } from "./SystemCall.sol";

type Delegation is bytes32;

using DelegationInstance for Delegation global;

library DelegationInstance {
  function exists(Delegation self) internal pure returns (bool) {
    return Delegation.unwrap(self) != bytes32("");
  }

  function isUnlimited(Delegation self) internal pure returns (bool) {
    return Delegation.unwrap(self) == UNLIMITED_DELEGATION;
  }

  function isLimited(Delegation self) internal pure returns (bool) {
    return exists(self) && !isUnlimited(self);
  }

  /**
   * Verify a delegation.
   * Returns true if the delegation exists and is valid, false otherwise.
   * Note: verifying the delegation might have side effects in the delegation control contract.
   */
  function verify(
    Delegation self,
    address delegator,
    address delegatee,
    bytes32 systemId,
    bytes memory funcSelectorAndArgs
  ) internal returns (bool) {
    // Early return if there is an unlimited delegation
    if (isUnlimited(self)) return true;

    // Early return if there is no valid delegation
    if (!exists(self)) return false;

    // Call the delegation control contract to check if the delegator has granted access to the delegatee
    (bool success, bytes memory data) = SystemCall.call({
      caller: delegatee,
      resourceSelector: Delegation.unwrap(self),
      funcSelectorAndArgs: abi.encodeWithSelector(
        IDelegationControl.verify.selector,
        delegator,
        systemId,
        funcSelectorAndArgs
      ),
      value: 0
    });

    if (!success) return false;
    return abi.decode(data, (bool));
  }
}
