// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { AccessManagementSystem } from "../src/modules/init/implementations/AccessManagementSystem.sol";
import { BalanceTransferSystem } from "../src/modules/init/implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "../src/modules/init/implementations/BatchCallSystem.sol";
import { CallWithSignatureSystem } from "../src/modules/init/implementations/CallWithSignatureSystem/CallWithSignatureSystem.sol";

import { InitModule } from "../src/modules/init/InitModule.sol";
import { RegistrationSystem } from "../src/modules/init/RegistrationSystem.sol";

function createInitModule() returns (InitModule) {
  return
    new InitModule(
      new AccessManagementSystem(),
      new BalanceTransferSystem(),
      new BatchCallSystem(),
      new RegistrationSystem(),
      new CallWithSignatureSystem()
    );
}
