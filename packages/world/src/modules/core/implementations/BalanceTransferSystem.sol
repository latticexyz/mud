// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "../../../System.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { IWorldErrors } from "../../../interfaces/IWorldErrors.sol";

import { Balances } from "../tables/Balances.sol";

contract BalanceTransferSystem is System, IWorldErrors {
  using ResourceSelector for bytes32;

  /**
   * Transfer balance to another namespace in the World
   */
  function transferBalanceToNamespace(bytes16 fromNamespace, bytes16 toNamespace, uint256 amount) public virtual {
    // Require caller to have access to the namespace
    AccessControl.requireAccess(fromNamespace, _msgSender());

    // Get current namespace balance
    uint256 balance = Balances.get(fromNamespace);

    // Require the balance balance to be greater or equal to the amount to transfer
    if (amount > balance) revert InsufficientBalance(balance, amount);

    // Update the balances
    Balances.set(fromNamespace, balance - amount);
    Balances.set(toNamespace, Balances.get(toNamespace) + amount);
  }

  /**
   * Transfer balance out of the World
   */
  function transferBalanceToAddress(bytes16 fromNamespace, address toAddress, uint256 amount) public virtual {
    // Require caller to have access to the namespace
    AccessControl.requireAccess(fromNamespace, _msgSender());

    // Get current namespace balance
    uint256 balance = Balances.get(fromNamespace);

    // Require the balance balance to be greater or equal to the amount to transfer
    if (amount > balance) revert InsufficientBalance(balance, amount);

    // Update the balances
    Balances.set(fromNamespace, balance - amount);

    // Transfer the balance to the given address, revert on failure
    (bool success, bytes memory data) = payable(toAddress).call{ value: amount }("");
    if (!success) revertWithBytes(data);
  }
}
