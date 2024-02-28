// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorldErrors } from "../../IWorldErrors.sol";

import { ModuleInstallationSystem } from "./implementations/ModuleInstallationSystem.sol";
import { StoreRegistrationSystem } from "./implementations/StoreRegistrationSystem.sol";
import { WorldRegistrationSystem } from "./implementations/WorldRegistrationSystem.sol";

/**
 * @title Registration System for World
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This system aggregates World registration and installation functionalities externalized from the World contract, aiming to keep the World contract's bytecode lean.
 * @dev Aggregates multiple system implementations for the World.
 */
contract RegistrationSystem is
  IWorldErrors,
  ModuleInstallationSystem,
  StoreRegistrationSystem,
  WorldRegistrationSystem
{
  // Currently, no additional functionality is added in this aggregate contract.
}
