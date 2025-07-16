// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

import { createWorld } from "@latticexyz/world/test/createWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { IModuleErrors } from "@latticexyz/world/src/IModuleErrors.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";

import { WorldConsumer } from "@latticexyz/world-consumer/src/experimental/WorldConsumer.sol";

import { ModuleConstants } from "../src/experimental/Constants.sol";
import { MUDERC20 } from "../src/experimental/MUDERC20.sol";
import { ERC20Module } from "../src/experimental/ERC20Module.sol";
import { ERC20Registry } from "../src/codegen/tables/ERC20Registry.sol";

library TestConstants {
  bytes16 constant ERC20_SYSTEM_NAME = "erc20system";
  bytes14 constant ERC20_NAMESPACE = "erc20namespace";
}

contract ERC20ModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld world;
  ERC20Module erc20Module = new ERC20Module();

  function setUp() public {
    world = createWorld();
    StoreSwitch.setStoreAddress(address(world));
  }

  function testInstall() public {
    bytes memory args = abi.encode(
      TestConstants.ERC20_NAMESPACE,
      TestConstants.ERC20_SYSTEM_NAME,
      "myERC20Token",
      "MTK"
    );
    startGasReport("install erc20 module");
    world.installModule(erc20Module, args);
    endGasReport();

    ResourceId erc20RegistryTableId = ModuleConstants.registryTableId();
    ResourceId erc20NamespaceId = WorldResourceIdLib.encodeNamespace(TestConstants.ERC20_NAMESPACE);

    // Token should retain access to the namespace
    address token = ERC20Registry.get(erc20RegistryTableId, erc20NamespaceId);

    // Module should grant the token access to the token namespace
    assertTrue(ResourceAccess.get(erc20NamespaceId, token), "Token does not have access to its namespace");

    // Module should transfer token namespace ownership to the creator
    assertEq(NamespaceOwner.get(erc20NamespaceId), address(this), "Token did not transfer ownership");

    assertEq(MUDERC20(token).name(), "myERC20Token");
    assertEq(MUDERC20(token).symbol(), "MTK");

    vm.expectRevert(IModuleErrors.Module_AlreadyInstalled.selector);
    world.installModule(erc20Module, args);
  }

  function testInstallExistingNamespace() public {
    ResourceId moduleNamespaceId = ModuleConstants.namespaceId();
    world.registerNamespace(moduleNamespaceId);

    bytes memory args = abi.encode(
      TestConstants.ERC20_NAMESPACE,
      TestConstants.ERC20_SYSTEM_NAME,
      "myERC20Token",
      "MTK"
    );

    // Installing will revert because module namespace already exists
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.World_ResourceAlreadyExists.selector,
        moduleNamespaceId,
        moduleNamespaceId.toString()
      )
    );
    world.installModule(erc20Module, args);
  }
}
