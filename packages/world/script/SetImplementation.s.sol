// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { World } from "../src/World.sol";
import { WorldProxy } from "../src/WorldProxy.sol";

contract SetImplementation is Script {
  function run(address worldAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    // Deploy new world implementation
    World worldImplementation = new World();

    // Set implementation on proxy
    WorldProxy(payable(worldAddress)).setImplementation(address(worldImplementation));

    vm.stopBroadcast();
  }
}
