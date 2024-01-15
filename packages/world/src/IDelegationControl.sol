// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorldContextConsumer, WORLD_CONTEXT_CONSUMER_INTERFACE_ID } from "./IWorldContextConsumer.sol";
import { ResourceId } from "./WorldResourceId.sol";

/**
 * @dev Calculation for ERC-165 interface ID for the IDelegationControl interface.
 * Combines the selector of the `verify` function with the interface ID of IWorldContextConsumer.
 */
bytes4 constant DELEGATION_CONTROL_INTERFACE_ID = IDelegationControl.verify.selector ^
  WORLD_CONTEXT_CONSUMER_INTERFACE_ID;

/**
 * @title IDelegationControl
 * @dev Interface for managing and verifying delegations within the context of a world.
 * Inherits functionalities from IWorldContextConsumer.
 */
interface IDelegationControl is IWorldContextConsumer {
  function verify(address delegator, ResourceId systemId, bytes memory callData) external returns (bool);
}
