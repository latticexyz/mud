// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title LimitedCallContext
 * @dev Systems are expected to be always called via the central World contract.
 * Depending on whether it is a root or non-root system, the call is performed via `delegatecall` or `call`.
 * Since Systems are expected to be stateless and only interact with the World state,
 * it is normally not necessary to prevent direct calls to the systems.
 * However, since the `CoreSystem` is known to always be registered as a root system in the World,
 * it is always expected to be delegatecalled, so we made this expectation explicit by reverting if it is not delegatecalled.
 *
 * @dev Based on OpenZeppelin's UUPSUpgradeable.sol
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/proxy/utils/UUPSUpgradeable.sol#L50
 */
contract LimitedCallContext {
  address private immutable __self = address(this);

  error UnauthorizedCallContext();

  modifier onlyDelegatecall() {
    _checkDelegatecall();
    _;
  }

  /**
   * @dev Reverts if the execution is not performed via delegatecall.
   */
  function _checkDelegatecall() internal view virtual {
    if (
      address(this) == __self // Must be called through delegatecall
    ) {
      revert UnauthorizedCallContext();
    }
  }
}
