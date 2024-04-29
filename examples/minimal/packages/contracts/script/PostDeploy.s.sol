// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { MessageTable } from "../src/codegen/index.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { ChatNamespacedSystem } from "../src/systems/ChatNamespacedSystem.sol";

contract PostDeploy is Script {
  using WorldResourceIdInstance for ResourceId;

  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast();

    // Manually deploy a system with another namespace
    ChatNamespacedSystem chatNamespacedSystem = new ChatNamespacedSystem();
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "ChatNamespaced"
    });
    IWorld(worldAddress).registerNamespace(systemId.getNamespaceId());
    IWorld(worldAddress).registerSystem(systemId, chatNamespacedSystem, true);
    IWorld(worldAddress).registerFunctionSelector(systemId, "sendMessage(string)");

    // Grant this system access to MessageTable
    IWorld(worldAddress).grantAccess(MessageTable._tableId, address(chatNamespacedSystem));

    // ------------------ EXAMPLES ------------------

    // Call increment on the world via the registered function selector
    uint32 newValue = IWorld(worldAddress).increment();
    console.log("Increment via IWorld:", newValue);

    vm.stopBroadcast();
  }
}
