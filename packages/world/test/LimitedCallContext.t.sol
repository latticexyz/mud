// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { createWorld } from "./createWorld.sol";
import { SystemCallData, SystemCallFromData } from "../src/modules/init/types.sol";
import { BalanceTransferSystem } from "../src/modules/init/implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "../src/modules/init/implementations/BatchCallSystem.sol";
import { WorldResourceIdLib } from "../src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";
import { Systems } from "../src/codegen/tables/Systems.sol";
import { LimitedCallContext } from "../src/modules/init/LimitedCallContext.sol";

contract LimitedCallContextTest is Test {
  IBaseWorld world;

  function setUp() public {
    world = createWorld();
    StoreSwitch.setStoreAddress(address(world));
  }

  function callAndDelegatecallSystem(ResourceId resourceId, bytes memory data) internal {
    (address system, ) = Systems.get(resourceId);

    bool success;

    vm.expectRevert(abi.encodeWithSelector(LimitedCallContext.UnauthorizedCallContext.selector));
    (success, ) = system.call(data);
  }

  function testTransferBalanceToNamespace() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "",
      name: "BalanceTransfer"
    });

    ResourceId fromNamespaceId;
    ResourceId toNamespaceId;
    uint256 amount;

    callAndDelegatecallSystem(
      resourceId,
      abi.encodeCall(BalanceTransferSystem.transferBalanceToNamespace, (fromNamespaceId, toNamespaceId, amount))
    );
  }

  function testTransferBalanceToAddress() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "",
      name: "BalanceTransfer"
    });

    ResourceId fromNamespaceId;
    address toAddress;
    uint256 amount;

    callAndDelegatecallSystem(
      resourceId,
      abi.encodeCall(BalanceTransferSystem.transferBalanceToAddress, (fromNamespaceId, toAddress, amount))
    );
  }

  function testBatchCall() public {
    ResourceId resourceId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "", name: "BatchCall" });

    SystemCallData[] memory systemCalls;

    callAndDelegatecallSystem(resourceId, abi.encodeCall(BatchCallSystem.batchCall, (systemCalls)));
  }

  function testBatchCallFrom() public {
    ResourceId resourceId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "", name: "BatchCall" });

    SystemCallFromData[] memory systemCalls;

    callAndDelegatecallSystem(resourceId, abi.encodeCall(BatchCallSystem.batchCallFrom, (systemCalls)));
  }
}
