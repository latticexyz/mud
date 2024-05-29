// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { Systems } from "@latticexyz/world/src/codegen/tables/Systems.sol";

import { MessageTable } from "../src/codegen/index.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { namespace__ChatNamespacedSystem } from "../src/systems/namespace__ChatNamespacedSystem.sol";

contract PostDeploy is Script {
  using WorldResourceIdInstance for ResourceId;

  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "ChatNamespacedSy"
    });
    address chatNamespacedSystem = Systems.getSystem(systemId);

    // Grant this system access to MessageTable
    IWorld(worldAddress).grantAccess(MessageTable._tableId, chatNamespacedSystem);

    // ------------------ EXAMPLES ------------------

    // Call increment on the world via the registered function selector
    uint32 newValue = IWorld(worldAddress).increment();
    console.log("Increment via IWorld:", newValue);

    vm.stopBroadcast();
  }
}
