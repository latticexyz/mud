// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorldErrors } from "../../IWorldErrors.sol";

import { BalanceTransferSystem } from "./implementations/BalanceTransferSystem.sol";

/**
 * @title Core System for World
 * @notice This system aggregates all World functionalities externalized from the World contract, aiming to keep the World contract's bytecode lean.
 * @dev Aggregates multiple system implementations for the World.
 * Split into multiple systems because of the bytecode size limit.
 */
contract CoreSystem2 is BalanceTransferSystem {
  // Currently, no additional functionality is added in this aggregate contract.
}
