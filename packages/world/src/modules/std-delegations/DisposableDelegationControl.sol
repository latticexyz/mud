// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { DelegationControl } from "../../DelegationControl.sol";
import { DisposableDelegations } from "./tables/DisposableDelegations.sol";

contract DisposableDelegationControl is DelegationControl {
  /**
   * Verify a delegation by checking if the delegator has any available calls left in the DisposableDelegations table and decrementing the available calls if so.
   */
  function verify(address delegator, bytes32 resourceSelector, bytes memory funcSelectorAndArgs) public returns (bool) {
    bytes32 funcSelectorAndArgsHash = keccak256(funcSelectorAndArgs);

    // Get the number of available calls for the given delegator, resourceSelector and funcSelectorAndArgs
    uint256 availableCalls = DisposableDelegations.get({
      delegator: delegator,
      delegatee: _msgSender(),
      resourceSelector: resourceSelector,
      funcSelectorAndArgsHash: funcSelectorAndArgsHash
    });

    if (availableCalls > 0) {
      // Decrement the number of available calls
      unchecked {
        DisposableDelegations.set({
          delegator: delegator,
          delegatee: _msgSender(),
          resourceSelector: resourceSelector,
          funcSelectorAndArgsHash: funcSelectorAndArgsHash,
          availableCalls: availableCalls - 1
        });
      }
      return true;
    }

    return false;
  }

  /**
   * Initialize a delegation by setting the number of available calls in the DisposableDelegations table
   */
  function initDelegation(
    address delegatee,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs,
    uint256 numCalls
  ) public {
    DisposableDelegations.set({
      delegator: _msgSender(),
      delegatee: delegatee,
      resourceSelector: resourceSelector,
      funcSelectorAndArgsHash: keccak256(funcSelectorAndArgs),
      availableCalls: numCalls
    });
  }
}
