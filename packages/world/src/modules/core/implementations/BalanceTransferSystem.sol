// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";

import { System } from "../../../System.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "../../../WorldResourceId.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { RESOURCE_NAMESPACE } from "../../../worldResourceTypes.sol";
import { IWorldErrors } from "../../../interfaces/IWorldErrors.sol";

import { Balances } from "../tables/Balances.sol";

contract BalanceTransferSystem is System, IWorldErrors {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  /**
   * Transfer balance to another namespace in the World
   */
  function transferBalanceToNamespace(
    ResourceId fromNamespaceId,
    ResourceId toNamespaceId,
    uint256 amount
  ) public virtual {
    // Require the target ID to be a namespace ID
    if (toNamespaceId.getType() != RESOURCE_NAMESPACE) {
      revert InvalidResourceType(string(bytes.concat(toNamespaceId.getType())));
    }

    // Require caller to have access to the namespace
    AccessControl.requireAccess(fromNamespaceId, _msgSender());

    // Get current namespace balance
    uint256 balance = Balances._get(ResourceId.unwrap(fromNamespaceId));

    // Require the balance balance to be greater or equal to the amount to transfer
    if (amount > balance) revert InsufficientBalance(balance, amount);

    // Update the balances
    Balances._set(ResourceId.unwrap(fromNamespaceId), balance - amount);
    Balances._set(ResourceId.unwrap(toNamespaceId), Balances._get(ResourceId.unwrap(toNamespaceId)) + amount);
  }

  /**
   * Transfer balance out of the World
   */
  function transferBalanceToAddress(ResourceId fromNamespaceId, address toAddress, uint256 amount) public virtual {
    // Require caller to have access to the namespace
    AccessControl.requireAccess(fromNamespaceId, _msgSender());

    // Get current namespace balance
    uint256 balance = Balances._get(ResourceId.unwrap(fromNamespaceId));

    // Require the balance balance to be greater or equal to the amount to transfer
    if (amount > balance) revert InsufficientBalance(balance, amount);

    // Update the balances
    Balances._set(ResourceId.unwrap(fromNamespaceId), balance - amount);

    // Transfer the balance to the given address, revert on failure
    (bool success, bytes memory data) = payable(toAddress).call{ value: amount }("");
    if (!success) revertWithBytes(data);
  }
}
