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

  function callSystem(ResourceId resourceId, bytes memory callData) internal {
    address system = Systems.getSystem(resourceId);

    // On low level calls, the status boolean corresponds to whether expectRevert succeeded or not.
    vm.expectRevert(abi.encodeWithSelector(LimitedCallContext.UnauthorizedCallContext.selector));
    (bool success, ) = system.call(callData);

    assertTrue(success);
  }

  function testTransferBalanceToNamespace() public {
    ResourceId fromNamespaceId;
    ResourceId toNamespaceId;
    uint256 amount;

    callSystem(
      BALANCE_TRANSFER_SYSTEM_ID,
      abi.encodeCall(BalanceTransferSystem.transferBalanceToNamespace, (fromNamespaceId, toNamespaceId, amount))
    );
  }

  function testTransferBalanceToAddress() public {
    ResourceId fromNamespaceId;
    address toAddress;
    uint256 amount;

    callSystem(
      BALANCE_TRANSFER_SYSTEM_ID,
      abi.encodeCall(BalanceTransferSystem.transferBalanceToAddress, (fromNamespaceId, toAddress, amount))
    );
  }

  function testBatchCall() public {
    SystemCallData[] memory systemCalls;

    callSystem(BATCH_CALL_SYSTEM_ID, abi.encodeCall(BatchCallSystem.batchCall, (systemCalls)));
  }

  function testBatchCallFrom() public {
    SystemCallFromData[] memory systemCalls;

    callSystem(BATCH_CALL_SYSTEM_ID, abi.encodeCall(BatchCallSystem.batchCallFrom, (systemCalls)));
  }
}
