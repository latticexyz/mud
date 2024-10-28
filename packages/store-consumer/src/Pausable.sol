// SPDX-License-Identifier: MIT
// Adapted from OpenZeppelin Contracts [utils/Pausable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f989fff93168606c726bc5e831ef50dd6e543f45/contracts/utils/Pausable.sol)
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { Paused as PausedTable } from "./codegen/tables/Paused.sol";
import { StoreConsumer } from "./StoreConsumer.sol";
import { Context } from "./Context.sol";
import { PausableTableNames } from "./Constants.sol";

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context, StoreConsumer {
  ResourceId internal immutable pausedId;

  /**
   * @dev Emitted when the pause is triggered by `account`.
   */
  event Paused(address account);

  /**
   * @dev Emitted when the pause is lifted by `account`.
   */
  event Unpaused(address account);

  /**
   * @dev The operation failed because the contract is paused.
   */
  error EnforcedPause();

  /**
   * @dev The operation failed because the contract is not paused.
   */
  error ExpectedPause();

  /**
   * @dev Initializes the contract in unpaused state.
   */
  constructor() {
    pausedId = _encodeTableId(PausableTableNames.PAUSED);
    PausedTable.register(pausedId);
    PausedTable.set(pausedId, false);
  }

  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   *
   * Requirements:
   *
   * - The contract must not be paused.
   */
  modifier whenNotPaused() {
    _requireNotPaused();
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   *
   * Requirements:
   *
   * - The contract must be paused.
   */
  modifier whenPaused() {
    _requirePaused();
    _;
  }

  /**
   * @dev Returns true if the contract is paused, and false otherwise.
   */
  function paused() public view virtual returns (bool) {
    return PausedTable.get(pausedId);
  }

  /**
   * @dev Throws if the contract is paused.
   */
  function _requireNotPaused() internal view virtual {
    if (paused()) {
      revert EnforcedPause();
    }
  }

  /**
   * @dev Throws if the contract is not paused.
   */
  function _requirePaused() internal view virtual {
    if (!paused()) {
      revert ExpectedPause();
    }
  }

  /**
   * @dev Triggers stopped state.
   *
   * Requirements:
   *
   * - The contract must not be paused.
   */
  function _pause() internal virtual whenNotPaused {
    PausedTable.set(pausedId, true);
    emit Paused(_msgSender());
  }

  /**
   * @dev Returns to normal state.
   *
   * Requirements:
   *
   * - The contract must be paused.
   */
  function _unpause() internal virtual whenPaused {
    PausedTable.set(pausedId, false);
    emit Unpaused(_msgSender());
  }
}
