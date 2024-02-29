// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { Position, Health, Terrain } from "../src/codegen/index.sol";
import { TerrainType } from "../src/codegen/common.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    StoreSwitch.setStoreAddress(worldAddress);

    address bob = makeAddr("bob");
    address alice = makeAddr("alice");
    address mary = makeAddr("mary");

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    Position.set({ player: bob, x: 1, y: -1 });
    Health.set({ player: bob, health: 5 });

    Position.set({ player: alice, x: 3, y: 5 });
    Health.set({ player: alice, health: 5 });

    Position.set({ player: mary, x: 3, y: 5 });
    Health.set({ player: mary, health: 0 });

    Terrain.set({ x: 3, y: 5, terrainType: TerrainType.Grassland });

    vm.stopBroadcast();
  }
}
