// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";
import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { CallboundDelegations } from "./tables/CallboundDelegations.sol";

contract CallboundDelegationControl is DelegationControl {
  /**
   * Verify a delegation by checking if the delegator has any available calls left in the CallboundDelegations table and decrementing the available calls if so.
   */
  function verify(address delegator, ResourceId systemId, bytes memory callData) public returns (bool) {
    bytes32 callDataHash = keccak256(callData);

    // Get the number of available calls for the given delegator, systemId and callData
    uint256 availableCalls = CallboundDelegations.get({
      delegator: delegator,
      delegatee: _msgSender(),
      systemId: systemId,
      callDataHash: callDataHash
    });

    if (availableCalls == 1) {
      // Remove the delegation from the CallboundDelegations table
      CallboundDelegations.deleteRecord({
        delegator: delegator,
        delegatee: _msgSender(),
        systemId: systemId,
        callDataHash: callDataHash
      });
      return true;
    }

    if (availableCalls > 0) {
      // Decrement the number of available calls
      unchecked {
        availableCalls--;
      }
      CallboundDelegations.set({
        delegator: delegator,
        delegatee: _msgSender(),
        systemId: systemId,
        callDataHash: callDataHash,
        availableCalls: availableCalls
      });
      return true;
    }

    return false;
  }

  /**
   * Initialize a delegation by setting the number of available calls in the CallboundDelegations table
   */
  function initDelegation(address delegatee, ResourceId systemId, bytes memory callData, uint256 numCalls) public {
    CallboundDelegations.set({
      delegator: _msgSender(),
      delegatee: delegatee,
      systemId: systemId,
      callDataHash: keccak256(callData),
      availableCalls: numCalls
    });
  }
}
