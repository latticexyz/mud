// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorldErrors } from "../../interfaces/IWorldErrors.sol";

import { RegistrationSystem } from "./implementations/RegistrationSystem.sol";
import { ModuleInstallationSystem } from "./implementations/ModuleInstallationSystem.sol";
import { AccessManagementSystem } from "./implementations/AccessManagementSystem.sol";
import { EphemeralRecordSystem } from "./implementations/EphemeralRecordSystem.sol";

/**
 * The CoreSystem includes all World functionality that is externalized
 * from the World contract to keep the World contract's bytecode as lean as possible.
 */
contract CoreSystem is
  IWorldErrors,
  RegistrationSystem,
  ModuleInstallationSystem,
  AccessManagementSystem,
  EphemeralRecordSystem
{

}
