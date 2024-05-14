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

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    // We can set table records directly
    Tasks.set("1", TasksData({ description: "Walk the dog", createdAt: block.timestamp, completedAt: 0 }));

    // Or we can call our own systems
    IWorld(worldAddress).app__addTask("Take out the trash");

    bytes32 key = IWorld(worldAddress).app__addTask("Do the dishes");
    IWorld(worldAddress).app__completeTask(key);

    vm.stopBroadcast();
  }
}
