// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";
import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { SystemboundDelegations } from "./tables/SystemboundDelegations.sol";

contract SystemboundDelegationControl is DelegationControl {
  /**
   * Verify a delegation by checking if the caller (delegatee) has any available calls left for the given delegator in the SystemboundDelegations table and decrementing the available calls if so.
   */
  function verify(address delegator, ResourceId systemId, bytes memory) public returns (bool) {
    // Get the number of available calls for the given delegator, systemId and callData
    uint256 availableCalls = SystemboundDelegations.get({
      delegator: delegator,
      delegatee: _msgSender(),
      systemId: systemId
    });

    if (availableCalls == 1) {
      // Remove the delegation from the SystemboundDelegations table
      SystemboundDelegations.deleteRecord({ delegator: delegator, delegatee: _msgSender(), systemId: systemId });
      return true;
    }

    if (availableCalls > 0) {
      // Decrement the number of available calls
      unchecked {
        availableCalls--;
      }
      SystemboundDelegations.set({
        delegator: delegator,
        delegatee: _msgSender(),
        systemId: systemId,
        availableCalls: availableCalls
      });
      return true;
    }

    return false;
  }

  /**
   * Initialize a delegation by setting the number of available calls in the SystemboundDelegations table
   */
  function initDelegation(address delegatee, ResourceId systemId, uint256 numCalls) public {
    SystemboundDelegations.set({
      delegator: _msgSender(),
      delegatee: delegatee,
      systemId: systemId,
      availableCalls: numCalls
    });
  }
}
