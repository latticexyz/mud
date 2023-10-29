// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { Position } from "../src/codegen/index.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    // Set up a bunch of position data so we can demonstrate filtering
    Position.set({ zone: "map1", x: 1, y: 1, player: msg.sender });
    Position.set({ zone: "map1", x: 2, y: -2, player: msg.sender });
    Position.set({ zone: "map2", x: 0, y: -99, player: msg.sender });
    Position.set({ zone: "map2", x: 0, y: 99, player: msg.sender });
    Position.set({ zone: "map99", x: 99, y: 99, player: msg.sender });

    vm.stopBroadcast();
  }
}
