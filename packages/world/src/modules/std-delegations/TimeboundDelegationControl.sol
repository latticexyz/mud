// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { DelegationControl } from "../../DelegationControl.sol";
import { TimeboundDelegations } from "./tables/TimeboundDelegations.sol";

contract TimeboundDelegationControl is DelegationControl {
  /**
   * Verify a delegation by checking if the current block timestamp is not larger than the max valid timestamp for the delegation.
   * Note: the delegation control check ignores the resourceSelector and funcSelectorAndArgs parameters.
   */
  function verify(address delegator, bytes32, bytes memory) public view returns (bool) {
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
