// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { MessageTable, MessageTableTableId } from "../src/codegen/index.sol";
import { ChatNamespacedSystem } from "../src/systems/ChatNamespacedSystem.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    // Manually deploy a system with another namespace
    ChatNamespacedSystem chatNamespacedSystem = new ChatNamespacedSystem();
    IWorld(worldAddress).registerSystem(
      ResourceSelector.from("namespace", "ChatNamespaced"),
      chatNamespacedSystem,
      true
    );
    IWorld(worldAddress).registerFunctionSelector(
      ResourceSelector.from("namespace", "ChatNamespaced"),
      "sendMessage",
      "(string)"
    );
    // Grant this system access to MessageTable
    IWorld(worldAddress).grantAccess(MessageTableTableId, address(chatNamespacedSystem));

    // ------------------ EXAMPLES ------------------

    // Call increment on the world via the registered function selector
    uint32 newValue = IWorld(worldAddress).increment();
    console.log("Increment via IWorld:", newValue);

    vm.stopBroadcast();
  }
}
