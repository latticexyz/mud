// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";
import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { TimeboundDelegations } from "./tables/TimeboundDelegations.sol";

contract TimeboundDelegationControl is DelegationControl {
  /**
   * Verify a delegation by checking if the current block timestamp is not larger than the max valid timestamp for the delegation.
   * Note: the delegation control check ignores the systemId and callData parameters.
   */
  function verify(address delegator, ResourceId, bytes memory) public view returns (bool) {
    // Get the max valid timestamp for the given delegator
    uint256 maxTimestamp = TimeboundDelegations.get({ delegator: delegator, delegatee: _msgSender() });

    // Return true if the current timestamp is smaller or equal to the max valid timestamp
    return block.timestamp <= maxTimestamp;
  }

  /**
   * Initialize a delegation by setting the max valid timestamp in the TimeboundDelegations table
   */
  function initDelegation(address delegatee, uint256 maxTimestamp) public {
    TimeboundDelegations.set({ delegator: _msgSender(), delegatee: delegatee, maxTimestamp: maxTimestamp });
  }
}
