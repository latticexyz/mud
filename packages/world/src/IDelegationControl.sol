// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorldContextConsumer } from "./IWorldContextConsumer.sol";
import { ResourceId } from "./WorldResourceId.sol";

/**
 * @title IDelegationControl
 * @dev Interface for managing and verifying delegations within the context of a world.
 * Inherits functionalities from IWorldContextConsumer.
 */
interface IDelegationControl is IWorldContextConsumer {
  function verify(address delegator, ResourceId systemId, bytes memory callData) external returns (bool);
}
