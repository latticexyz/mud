// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "./System.sol";
import { WorldContextConsumer } from "./WorldContext.sol";
import { IDelegationControl } from "./IDelegationControl.sol";
import { IWorldContextConsumer } from "./IWorldContextConsumer.sol";
import { IERC165 } from "./IERC165.sol";

/**
 * @title DelegationControl
 * @dev Abstract contract to manage delegations and check interface support.
 *      Inherits functionalities from WorldContextConsumer and IDelegationControl.
 */
abstract contract DelegationControl is System, IDelegationControl {
  /**
   * @notice Check if the given interfaceId is supported by this contract.
   * @dev Overrides the functionality from IERC165 and WorldContextConsumer to check for supported interfaces.
   * @param interfaceId The bytes4 identifier for the interface.
   * @return true if the interface is supported, false otherwise.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public pure virtual override(IERC165, WorldContextConsumer) returns (bool) {
    return
      interfaceId == type(IDelegationControl).interfaceId ||
      interfaceId == type(IWorldContextConsumer).interfaceId ||
      interfaceId == type(IERC165).interfaceId;
  }
}
