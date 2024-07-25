// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    // ------------------ EXAMPLES ------------------

    // Call increment on the world via the registered function selector
    uint32 newValue = IWorld(worldAddress).app__increment();
    console.log("Increment via IWorld:", newValue);

    // Add checkboxes
    for (uint256 i = 0; i < 100; i++) {
      IWorld(worldAddress).app__addCheckbox(i, i % 2 == 0);
    }

    // Or we can call our own systems
    IWorld(worldAddress).app__addTask("Take out the trash");

    bytes32 key = IWorld(worldAddress).app__addTask("Do the dishes");
    IWorld(worldAddress).app__completeTask(key);

    vm.stopBroadcast();
  }
}
