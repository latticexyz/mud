// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorldContextConsumer } from "./IWorldContextConsumer.sol";
import { ResourceId } from "./WorldResourceId.sol";

/**
 * @title IDelegationControl
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Interface for managing and verifying delegations within the context of a world.
 * Inherits functionalities from IWorldContextConsumer.
 */
interface IDelegationControl is IWorldContextConsumer {
  function verify(address delegator, ResourceId systemId, bytes memory callData) external returns (bool);
}
