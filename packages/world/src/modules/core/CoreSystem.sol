// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorldErrors } from "../../IWorldErrors.sol";

import { AccessManagementSystem } from "./implementations/AccessManagementSystem.sol";
import { BalanceTransferSystem } from "./implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "./implementations/BatchCallSystem.sol";
import { ModuleInstallationSystem } from "./implementations/ModuleInstallationSystem.sol";
import { StoreRegistrationSystem } from "./implementations/StoreRegistrationSystem.sol";
import { WorldRegistrationSystem } from "./implementations/WorldRegistrationSystem.sol";

/**
 * The CoreSystem includes all World functionality that is externalized
 * from the World contract to keep the World contract's bytecode as lean as possible.
 */
contract CoreSystem is
  IWorldErrors,
  AccessManagementSystem,
  BalanceTransferSystem,
  BatchCallSystem,
  ModuleInstallationSystem,
  StoreRegistrationSystem,
  WorldRegistrationSystem
{

}
