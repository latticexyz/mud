// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { createWorld } from "./createWorld.sol";

import { SystemCallData, SystemCallFromData } from "../src/modules/init/types.sol";
import { LimitedCallContext } from "../src/modules/init/LimitedCallContext.sol";

import { AccessManagementSystem } from "../src/modules/init/implementations/AccessManagementSystem.sol";
import { BalanceTransferSystem } from "../src/modules/init/implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "../src/modules/init/implementations/BatchCallSystem.sol";

import { RegistrationSystem } from "../src/modules/init/RegistrationSystem.sol";
import { ACCESS_MANAGEMENT_SYSTEM_ID, BALANCE_TRANSFER_SYSTEM_ID, BATCH_CALL_SYSTEM_ID, REGISTRATION_SYSTEM_ID } from "../src/modules/init/constants.sol";

import { Systems } from "../src/codegen/tables/Systems.sol";

contract LimitedCallContextTest is Test {
  function setUp() public {
    StoreSwitch.setStoreAddress(address(createWorld()));
  }

  function callSystem(ResourceId resourceId, string memory functionSignature) internal {
    address system = Systems.getSystem(resourceId);

    // Generate empty calldata of sufficient length (any additional bytes are ignored)
    bytes memory callData = new bytes(1000);
    // Copy the selector into the calldata
    bytes memory selector = abi.encodeWithSignature(functionSignature);
    for (uint256 i = 0; i < selector.length; i++) {
      callData[i] = selector[i];
    }

    // On low level calls, the status boolean corresponds to whether expectRevert succeeded or not.
    vm.expectRevert(abi.encodeWithSelector(LimitedCallContext.UnauthorizedCallContext.selector));
    (bool success, ) = system.call(callData);

    assertTrue(success);
  }

  function testAccessManagementSystem() public {
    string[4] memory functionSignaturesAccessManagement = [
      // --- AccessManagementSystem ---
      "grantAccess(bytes32,address)",
      "revokeAccess(bytes32,address)",
      "transferOwnership(bytes32,address)",
      "renounceOwnership(bytes32)"
    ];

    for (uint256 i; i < functionSignaturesAccessManagement.length; i++) {
      callSystem(ACCESS_MANAGEMENT_SYSTEM_ID, functionSignaturesAccessManagement[i]);
    }
  }

  function testBalanceTransferSystem() public {
    string[2] memory functionSignaturesBalanceTransfer = [
      // --- BalanceTransferSystem ---
      "transferBalanceToNamespace(bytes32,bytes32,uint256)",
      "transferBalanceToAddress(bytes32,address,uint256)"
    ];

    for (uint256 i; i < functionSignaturesBalanceTransfer.length; i++) {
      callSystem(BALANCE_TRANSFER_SYSTEM_ID, functionSignaturesBalanceTransfer[i]);
    }
  }

  function testBatchCallSystem() public {
    string[2] memory functionSignaturesBatchCall = [
      // --- BatchCallSystem ---
      "batchCall((bytes32,bytes)[])",
      "batchCallFrom((address,bytes32,bytes)[])"
    ];

    for (uint256 i; i < functionSignaturesBatchCall.length; i++) {
      callSystem(BATCH_CALL_SYSTEM_ID, functionSignaturesBatchCall[i]);
    }
  }

  function testRegistrationSystem() public {
    string[14] memory functionSignaturesRegistration = [
      // --- ModuleInstallationSystem ---
      "installModule(address,bytes)",
      // --- StoreRegistrationSystem ---
      "registerTable(bytes32,bytes32,bytes32,bytes32,string[],string[])",
      "registerStoreHook(bytes32,address,uint8)",
      "unregisterStoreHook(bytes32,address)",
      // --- WorldRegistrationSystem ---
      "registerNamespace(bytes32)",
      "registerSystemHook(bytes32,address,uint8)",
      "unregisterSystemHook(bytes32,address)",
      "registerSystem(bytes32,address,bool)",
      "registerFunctionSelector(bytes32,string)",
      "registerRootFunctionSelector(bytes32,string,bytes4)",
      "registerDelegation(address,bytes32,bytes)",
      "unregisterDelegation(address)",
      "registerNamespaceDelegation(bytes32,bytes32,bytes)",
      "unregisterNamespaceDelegation(bytes32)"
    ];

    for (uint256 i; i < functionSignaturesRegistration.length; i++) {
      callSystem(REGISTRATION_SYSTEM_ID, functionSignaturesRegistration[i]);
    }
  }
}
