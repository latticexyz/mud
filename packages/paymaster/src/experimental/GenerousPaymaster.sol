// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IPaymaster } from "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import { IEntryPoint } from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import { PackedUserOperation } from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import { BasePaymaster } from "@account-abstraction/contracts/core/BasePaymaster.sol";

/**
 * @title Generous Paymaster
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This contract is a simple paymaster that sponsors all user operations.
 *      It is intended for local development purposes.
 */
contract GenerousPaymaster is BasePaymaster {
  constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}

  /**
   * Payment validation: check if paymaster agrees to pay.
   * Revert to reject this request.
   * Note that bundlers will reject this method if it changes the state, unless the paymaster is trusted (whitelisted).
   * The paymaster pre-pays using its deposit, and receive back a refund after the postOp method returns.
   * @param userOp          - The user operation.
   * @param userOpHash      - Hash of the user's request data.
   * @param maxCost         - The maximum cost of this transaction (based on maximum gas and gas price from userOp).
   * @return context        - Value to send to a postOp. Zero length to signify postOp is not required.
   * @return validationData - Signature and time-range of this operation, encoded the same as the return
   *                          value of validateUserOperation.
   *                          <20-byte> sigAuthorizer - 0 for valid signature, 1 to mark signature failure,
   *                                                    other values are invalid for paymaster.
   *                          <6-byte> validUntil - last timestamp this operation is valid. 0 for "indefinite"
   *                          <6-byte> validAfter - first timestamp this operation is valid
   *                          Note that the validation code cannot use block.timestamp (or block.number) directly.
   */
  function _validatePaymasterUserOp(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 maxCost
  ) internal override returns (bytes memory context, uint256 validationData) {
    // No validation required, since this paymaster sponsors all user operations.
  }

  /**
   * Post-operation handler.
   * @param mode          - Enum with the following options:
   *                        opSucceeded - User operation succeeded.
   *                        opReverted  - User op reverted. The paymaster still has to pay for gas.
   *                        postOpReverted - never passed in a call to postOp().
   * @param context       - The context value returned by validatePaymasterUserOp
   * @param actualGasCost - Actual gas used so far (without this postOp call).
   * @param actualUserOpFeePerGas - the gas price this UserOp pays. This value is based on the UserOp's maxFeePerGas
   *                        and maxPriorityFee (and basefee)
   *                        It is not the same as tx.gasprice, which is what the bundler pays.
   */
  function _postOp(
    IPaymaster.PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost,
    uint256 actualUserOpFeePerGas
  ) internal override {}
}
