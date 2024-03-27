// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "@account-abstraction/core/BasePaymaster.sol";
import "@account-abstraction/core/UserOperationLib.sol";
import "@account-abstraction/core/Helpers.sol";

contract MockPaymaster is BasePaymaster {
  using UserOperationLib for PackedUserOperation;

  constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}

  /**
   * Paymaster that accepts all userOperations.
   */
  function _validatePaymasterUserOp(
    PackedUserOperation calldata /*userOperation*/,
    bytes32 /*userOpHash*/,
    uint256 requiredPreFund
  ) internal pure override returns (bytes memory context, uint256 validationData) {
    (requiredPreFund);
    return ("", _packValidationData(false, 0, 0));
  }
}
