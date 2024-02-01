// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { AccessManagementSystem } from "../src/modules/core/implementations/AccessManagementSystem.sol";
import { BalanceTransferSystem } from "../src/modules/core/implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "../src/modules/core/implementations/BatchCallSystem.sol";

import { InitModule } from "../src/modules/core/InitModule.sol";
import { RegistrationSystem } from "../src/modules/core/RegistrationSystem.sol";

function createInitModule() returns (InitModule) {
  return
    new InitModule(
      new AccessManagementSystem(),
      new BalanceTransferSystem(),
      new BatchCallSystem(),
      new RegistrationSystem()
    );
}
