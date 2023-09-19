// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "../../../System.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";
import { ResourceId } from "../../../ResourceId.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { IWorldErrors } from "../../../interfaces/IWorldErrors.sol";

import { Balances } from "../tables/Balances.sol";

// TODO: use namespace ID for balance table (bytes32 instead of bytes14)
// TODO: could even use resource ID for balance table, so systems can have their own balance in the table

contract BalanceTransferSystem is System, IWorldErrors {
  using ResourceId for bytes32;

  /**
   * Transfer balance to another namespace in the World
   */
  function transferBalanceToNamespace(bytes14 fromNamespace, bytes14 toNamespace, uint256 amount) public virtual {
    // Require caller to have access to the namespace
    AccessControl.requireAccess(ResourceId.encodeNamespace(fromNamespace), _msgSender());

    // Get current namespace balance
    uint256 balance = Balances._get(fromNamespace);

    // Require the balance balance to be greater or equal to the amount to transfer
    if (amount > balance) revert InsufficientBalance(balance, amount);

    // Update the balances
    Balances._set(fromNamespace, balance - amount);
    Balances._set(toNamespace, Balances._get(toNamespace) + amount);
  }

  /**
   * Transfer balance out of the World
   */
  function transferBalanceToAddress(bytes14 fromNamespace, address toAddress, uint256 amount) public virtual {
    // Require caller to have access to the namespace
    AccessControl.requireAccess(ResourceId.encodeNamespace(fromNamespace), _msgSender());

    // Get current namespace balance
    uint256 balance = Balances._get(fromNamespace);

    // Require the balance balance to be greater or equal to the amount to transfer
    if (amount > balance) revert InsufficientBalance(balance, amount);

    // Update the balances
    Balances._set(fromNamespace, balance - amount);

    // Transfer the balance to the given address, revert on failure
    (bool success, bytes memory data) = payable(toAddress).call{ value: amount }("");
    if (!success) revertWithBytes(data);
  }
}
