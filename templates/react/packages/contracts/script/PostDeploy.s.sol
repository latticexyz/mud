// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Tasks, TasksData } from "../src/codegen/index.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast();

    // We can set table records directly
    Tasks.set("1", TasksData({ description: "Walk the dog", createdAt: block.timestamp, completedAt: 0 }));

    // Or we can call our own systems
    IWorld(worldAddress).addTask("Take out the trash");

    bytes32 key = IWorld(worldAddress).addTask("Do the dishes");
    IWorld(worldAddress).completeTask(key);

    vm.stopBroadcast();
  }
}
