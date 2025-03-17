// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { createWorld } from "./createWorld.sol";

import { LimitedCallContext } from "../src/modules/init/LimitedCallContext.sol";
import { getFunctionSignaturesAccessManagement, getFunctionSignaturesBalanceTransfer, getFunctionSignaturesBatchCall, getFunctionSignaturesRegistration, getFunctionSignaturesCallWithSignature } from "../src/modules/init/functionSignatures.sol";

import { ACCESS_MANAGEMENT_SYSTEM_ID, BALANCE_TRANSFER_SYSTEM_ID, BATCH_CALL_SYSTEM_ID, REGISTRATION_SYSTEM_ID, CALL_WITH_SIGNATURE_SYSTEM_ID } from "../src/modules/init/constants.sol";

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

    // In this low level call, the status boolean corresponds to whether we reverted with `UnauthorizedCallContext`
    vm.expectRevert(abi.encodeWithSelector(LimitedCallContext.UnauthorizedCallContext.selector));
    (bool success, ) = system.call(callData);

    assertTrue(success);
  }

  function testAccessManagementSystem() public {
    string[4] memory functionSignaturesAccessManagement = getFunctionSignaturesAccessManagement();

    for (uint256 i; i < functionSignaturesAccessManagement.length; i++) {
      callSystem(ACCESS_MANAGEMENT_SYSTEM_ID, functionSignaturesAccessManagement[i]);
    }
  }

  function testBalanceTransferSystem() public {
    string[2] memory functionSignaturesBalanceTransfer = getFunctionSignaturesBalanceTransfer();

    for (uint256 i; i < functionSignaturesBalanceTransfer.length; i++) {
      callSystem(BALANCE_TRANSFER_SYSTEM_ID, functionSignaturesBalanceTransfer[i]);
    }
  }

  function testBatchCallSystem() public {
    string[2] memory functionSignaturesBatchCall = getFunctionSignaturesBatchCall();

    for (uint256 i; i < functionSignaturesBatchCall.length; i++) {
      callSystem(BATCH_CALL_SYSTEM_ID, functionSignaturesBatchCall[i]);
    }
  }

  function testRegistrationSystem() public {
    string[14] memory functionSignaturesRegistration = getFunctionSignaturesRegistration();

    for (uint256 i; i < functionSignaturesRegistration.length; i++) {
      callSystem(REGISTRATION_SYSTEM_ID, functionSignaturesRegistration[i]);
    }
  }

  function testCallWithSignatureSystem() public {
    string[1] memory functionSignaturesCallWithSignature = getFunctionSignaturesCallWithSignature();

    for (uint256 i; i < functionSignaturesCallWithSignature.length; i++) {
      callSystem(CALL_WITH_SIGNATURE_SYSTEM_ID, functionSignaturesCallWithSignature[i]);
    }
  }
}
