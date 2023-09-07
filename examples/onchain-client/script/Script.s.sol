// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Script } from "forge-std/src/Script.sol";
import { console } from "forge-std/src/console.sol";

import { Counter } from "codegen/Tables.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract ScriptClient is Script {
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

    console.log("Incrementing the counter");
    world.increment();

    console.log("The counter values is now ", Counter.get(world));

    // Stop broadcasting transactions from the account
    vm.stopBroadcast();
  }
}

contract BypassSecurity is Script {
  IWorld world;

  function run() external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 myPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from that account
    vm.startBroadcast(myPrivateKey);

    // Connect to the world using `WORLD_ADDR` from .env
    console.log("Connecting to world at ", vm.envAddress("WORLD_ADDR"));
    world = IWorld(vm.envAddress("WORLD_ADDR"));

    // Try to set `Counter` directly. See that it fails.
    console.log("Just before trying to reset the counter");
    Counter.set(world, 0);
    console.log("Just after trying to reset the counter");

    // Stop broadcasting transactions from the account
    vm.stopBroadcast();
  }
}
