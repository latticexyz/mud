// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";

import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { createWorld } from "./createWorld.sol";
import { SystemCallData, SystemCallFromData } from "../src/modules/init/types.sol";
import { BatchCallSystem } from "../src/modules/init/implementations/BatchCallSystem.sol";
import { WorldResourceIdLib, WorldResourceIdInstance, NAMESPACE_BITS, NAME_BITS, TYPE_BITS } from "../src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";
import { Systems } from "../src/codegen/tables/Systems.sol";
import { LimitedCallContext } from "../src/modules/init/LimitedCallContext.sol";

contract LimitedCallContextTest is Test {
  error UnauthorizedCallContext();

  IBaseWorld world;

  function setUp() public {
    world = createWorld();
    StoreSwitch.setStoreAddress(address(world));
  }

  function testBatchCall() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "name"
    });

    (address system, ) = Systems.get(resourceId);

    SystemCallData[] memory systemCalls;
    bool success;

    vm.expectRevert(abi.encodeWithSelector(LimitedCallContext.UnauthorizedCallContext.selector));
    (success, ) = system.call(abi.encodeCall(BatchCallSystem.batchCall, (systemCalls)));

    (success, ) = system.delegatecall(abi.encodeCall(BatchCallSystem.batchCall, (systemCalls)));
    assertTrue(success);
  }

  function testBatchCallFrom() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "name"
    });

    (address system, ) = Systems.get(resourceId);

    SystemCallFromData[] memory systemCalls;
    bool success;

    vm.expectRevert(abi.encodeWithSelector(LimitedCallContext.UnauthorizedCallContext.selector));
    (success, ) = system.call(abi.encodeCall(BatchCallSystem.batchCallFrom, (systemCalls)));

    (success, ) = system.delegatecall(abi.encodeCall(BatchCallSystem.batchCallFrom, (systemCalls)));
    assertTrue(success);
  }
}
