// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { Counter } from "codegen/Tables.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract Fail is Script {
  IWorld world;

  function run() external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 myPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from that account
    vm.startBroadcast(myPrivateKey);

    // Connect to the world using `WORLD_ADDR` from .env
    console.log("Connecting to world at ", vm.envAddress("WORLD_ADDR"));
    world = IWorld(vm.envAddress("WORLD_ADDR"));

    console.log("The counter values is now ", Counter.get(world));

    // Try to set `Counter` directly. See that it fails.
    Counter.set(world, 0);

    // Stop broadcasting transactions from the account
    vm.stopBroadcast();
  }
}
