// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { AccessManagementSystem } from "../src/modules/core/implementations/AccessManagementSystem.sol";
import { BalanceTransferSystem } from "../src/modules/core/implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "../src/modules/core/implementations/BatchCallSystem.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { CoreRegistrationSystem } from "../src/modules/core/CoreRegistrationSystem.sol";

function createCoreModule() returns (CoreModule) {
  return
    new CoreModule(
      new AccessManagementSystem(),
      new BalanceTransferSystem(),
      new BatchCallSystem(),
      new CoreRegistrationSystem()
    );
}
