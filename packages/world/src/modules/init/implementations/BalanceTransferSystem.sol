// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { System } from "../../../System.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";
import { WorldResourceIdInstance } from "../../../WorldResourceId.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { RESOURCE_NAMESPACE } from "../../../worldResourceTypes.sol";
import { IWorldErrors } from "../../../IWorldErrors.sol";

import { Balances } from "../../../codegen/tables/Balances.sol";
import { requireNamespace } from "../../../requireNamespace.sol";

import { LimitedCallContext } from "../LimitedCallContext.sol";

/**
 * @title Balance Transfer System
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev A system contract that facilitates balance transfers in the World and outside of the World.
 */
contract BalanceTransferSystem is System, IWorldErrors, LimitedCallContext {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @notice Transfer balance to another namespace in the World.
   * @dev Requires the caller to have access to the source namespace and ensures the destination namespace type is valid.
   * @param fromNamespaceId The source namespace from which the balance will be deducted.
   * @param toNamespaceId The target namespace where the balance will be added.
   * @param amount The amount to transfer.
   */
  function transferBalanceToNamespace(
    ResourceId fromNamespaceId,
    ResourceId toNamespaceId,
    uint256 amount
  ) public virtual onlyDelegatecall {
    // Ensure the "from" namespace resource is a namespace
    requireNamespace(fromNamespaceId);
    // Ensure the "to" namespace resource is a namespace
    requireNamespace(toNamespaceId);

    // Require the namespace to exist
    AccessControl.requireExistence(toNamespaceId);

    // Require caller to have access to the namespace
    AccessControl.requireAccess(fromNamespaceId, _msgSender());

    // Get current namespace balance
    uint256 balance = Balances._get(fromNamespaceId);

    // Require the balance balance to be greater or equal to the amount to transfer
    if (amount > balance) revert World_InsufficientBalance(balance, amount);

    // Update the balances
    Balances._set(fromNamespaceId, balance - amount);
    Balances._set(toNamespaceId, Balances._get(toNamespaceId) + amount);
  }

  /**
   * @notice Transfer balance out of the World to a specific address.
   * @dev Requires the caller to have access to the source namespace and ensures sufficient balance before transfer.
   * @param fromNamespaceId The source namespace from which the balance will be deducted.
   * @param toAddress The target address where the balance will be sent.
   * @param amount The amount to transfer.
   */
  function transferBalanceToAddress(
    ResourceId fromNamespaceId,
    address toAddress,
    uint256 amount
  ) public virtual onlyDelegatecall {
    // Require caller to have access to the namespace
    AccessControl.requireAccess(fromNamespaceId, _msgSender());

    // Get current namespace balance
    uint256 balance = Balances._get(fromNamespaceId);

    // Require the balance to be greater or equal to the amount to transfer
    if (amount > balance) revert World_InsufficientBalance(balance, amount);

    // Update the balances
    Balances._set(fromNamespaceId, balance - amount);

    // Transfer the balance to the given address, revert on failure
    (bool success, bytes memory data) = payable(toAddress).call{ value: amount }("");
    if (!success) revertWithBytes(data);
  }
}
