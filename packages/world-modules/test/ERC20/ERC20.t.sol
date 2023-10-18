// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { ERC20Module } from "../../src/modules/erc20/ERC20Module.sol";
import { MetadataData } from "../../src/modules/erc20/tables/Metadata.sol";
import { ERC20Registry } from "../../src/modules/erc20/tables/ERC20Registry.sol";
import { ERC20_REGISTRY_TABLE_ID } from "../../src/modules/erc20/constants.sol";

bytes14 constant TEST_NAMESPACE = "myerc20";

contract ERC20Test is Test {
  IBaseWorld world;
  ERC20Module erc20Module;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
    StoreSwitch.setStoreAddress(address(world));

    // Deploy a new ERC20 module
    erc20Module = new ERC20Module();

    // Install the ERC20 module
    world.installModule(
      erc20Module,
      abi.encode(TEST_NAMESPACE, MetadataData({ totalSupply: 10000, decimals: 18, name: "Test Token", symbol: "TST" }))
    );

    address tokenAddress = ERC20Registry.get(
      ERC20_REGISTRY_TABLE_ID,
      WorldResourceIdLib.encodeNamespace(TEST_NAMESPACE)
    );
  }

  function testInstall() public {
    bytes14 namespace = "anotherERC20";
    // Install the ERC20 module
    world.installModule(
      erc20Module,
      abi.encode(namespace, MetadataData({ totalSupply: 10000, decimals: 18, name: "Test Token", symbol: "TST" }))
    );

    address tokenAddress = ERC20Registry.get(ERC20_REGISTRY_TABLE_ID, WorldResourceIdLib.encodeNamespace(namespace));
    assertTrue(tokenAddress != address(0));
  }
}
