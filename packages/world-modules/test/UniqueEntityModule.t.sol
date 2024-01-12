// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { IModule } from "@latticexyz/world/src/IModule.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { createCoreModule } from "@latticexyz/world/test/createCoreModule.sol";
import { UniqueEntityModule } from "../src/modules/uniqueentity/UniqueEntityModule.sol";
import { UniqueEntity } from "../src/modules/uniqueentity/tables/UniqueEntity.sol";
import { getUniqueEntity } from "../src/modules/uniqueentity/getUniqueEntity.sol";

import { NAMESPACE, TABLE_NAME } from "../src/modules/uniqueentity/constants.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/world/src/worldResourceTypes.sol";

contract UniqueEntityTestSystem is System {
  function echoUniqueEntity() public returns (bytes32) {
    // Execute `getUniqueEntity` from the context of a World
    return getUniqueEntity();
  }
}

contract UniqueEntityModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld world;
  UniqueEntityModule uniqueEntityModule = new UniqueEntityModule();
  ResourceId _tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: NAMESPACE, name: TABLE_NAME });

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(createCoreModule());
    StoreSwitch.setStoreAddress(address(world));
  }

  function testInstall() public {
    ResourceId tableId = _tableId;

    startGasReport("install unique entity module");
    world.installModule(uniqueEntityModule, new bytes(0));
    endGasReport();

    startGasReport("get a unique entity nonce (non-root module)");
    uint256 uniqueEntity = uint256(getUniqueEntity(world));
    endGasReport();

    // Table must have the same entity set
    assertEq(UniqueEntity.get(tableId), uniqueEntity);
    // The next entity must be incremented
    assertEq(uint256(getUniqueEntity(world)), uniqueEntity + 1);
    assertEq(UniqueEntity.get(tableId), uniqueEntity + 1);
  }

  function testInstallTwice() public {
    world.installModule(uniqueEntityModule, new bytes(0));
    vm.expectRevert(IModule.Module_AlreadyInstalled.selector);
    world.installModule(uniqueEntityModule, new bytes(0));
  }

  function testInstallRoot() public {
    ResourceId tableId = _tableId;

    startGasReport("installRoot unique entity module");
    world.installRootModule(uniqueEntityModule, new bytes(0));
    endGasReport();

    startGasReport("get a unique entity nonce (root module)");
    uint256 uniqueEntity = uint256(getUniqueEntity(world));
    endGasReport();

    // Table must have the same entity set
    assertEq(UniqueEntity.get(tableId), uniqueEntity);
    // The next entity must be incremented
    assertEq(uint256(getUniqueEntity(world)), uniqueEntity + 1);
    assertEq(UniqueEntity.get(tableId), uniqueEntity + 1);
  }

  function testInstallRootTwice() public {
    world.installRootModule(uniqueEntityModule, new bytes(0));
    vm.expectRevert(IModule.Module_AlreadyInstalled.selector);
    world.installRootModule(uniqueEntityModule, new bytes(0));
  }

  function testPublicAccess() public {
    ResourceId tableId = _tableId;

    world.installModule(uniqueEntityModule, new bytes(0));

    // Anyone should be able to call `getUniqueEntity`
    address alice = address(bytes20(keccak256("alice")));
    vm.startPrank(alice);
    uint256 uniqueEntity = uint256(getUniqueEntity(world));

    // Table must have the same entity set
    assertEq(UniqueEntity.get(tableId), uniqueEntity);
    // The next entity must be incremented
    assertEq(uint256(getUniqueEntity(world)), uniqueEntity + 1);
    assertEq(UniqueEntity.get(tableId), uniqueEntity + 1);

    // But changing the table directly isn't allowed
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.World_AccessDenied.selector,
        WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: NAMESPACE, name: TABLE_NAME }).toString(),
        alice
      )
    );
    UniqueEntity.set(world, tableId, 123);
  }

  function testAccessInWorldContext() public {
    world.installModule(uniqueEntityModule, new bytes(0));

    // Set up a system that calls `getUniqueEntity` from the context of a World
    UniqueEntityTestSystem uniqueEntityTestSystem = new UniqueEntityTestSystem();
    ResourceId uniqueEntityTestSystemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "somens",
      name: "echoUniqueEntity"
    });
    world.registerNamespace(uniqueEntityTestSystemId.getNamespaceId());
    world.registerSystem(uniqueEntityTestSystemId, uniqueEntityTestSystem, true);

    // Execute `getUniqueEntity` from the context of a World
    bytes32 uniqueEntity1 = abi.decode(
      world.call(uniqueEntityTestSystemId, abi.encodeCall(UniqueEntityTestSystem.echoUniqueEntity, ())),
      (bytes32)
    );
    bytes32 uniqueEntity2 = abi.decode(
      world.call(uniqueEntityTestSystemId, abi.encodeCall(UniqueEntityTestSystem.echoUniqueEntity, ())),
      (bytes32)
    );
    bytes32 uniqueEntity3 = getUniqueEntity(world);

    // The next entity must be incremented
    assertEq(uint256(uniqueEntity2), uint256(uniqueEntity1) + 1);
    assertEq(uint256(uniqueEntity3), uint256(uniqueEntity2) + 1);
  }
}
