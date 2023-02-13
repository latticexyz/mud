// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Foundry
import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

// Libraries
import {LibDeploy, DeployResult} from "./LibDeploy.sol";

contract Deploy is Script {
  function broadcastDeploy(
    address _deployer,
    address _world,
    bool _reuseComponents
  ) public returns (address world, uint256 initialBlockNumber) {
    vmSafe.startBroadcast(_deployer);
    initialBlockNumber = block.number;
    DeployResult memory result = LibDeploy.deploy(_deployer, _world, _reuseComponents);
    vmSafe.stopBroadcast();
    world = address(result.world);
  }
}
