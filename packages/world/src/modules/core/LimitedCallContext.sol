// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

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
