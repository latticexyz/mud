// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { UniqueEntityModule } from "../src/modules/uniqueentity/UniqueEntityModule.sol";
import { UniqueEntity } from "../src/modules/uniqueentity/tables/UniqueEntity.sol";
import { getUniqueEntity } from "../src/modules/uniqueentity/getUniqueEntity.sol";

import { NAMESPACE, TABLE_NAME } from "../src/modules/uniqueentity/constants.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "../src/WorldResourceId.sol";
import { RESOURCE_TABLE } from "../src/worldResourceTypes.sol";

contract UniqueEntityModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld world;
  UniqueEntityModule uniqueEntityModule = new UniqueEntityModule();
  ResourceId _tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: NAMESPACE, name: TABLE_NAME });

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
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
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity);
    // The next entity must be incremented
    assertEq(uint256(getUniqueEntity(world)), uniqueEntity + 1);
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity + 1);
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
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity);
    // The next entity must be incremented
    assertEq(uint256(getUniqueEntity(world)), uniqueEntity + 1);
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity + 1);
  }

  function testPublicAccess() public {
    ResourceId tableId = _tableId;

    world.installModule(uniqueEntityModule, new bytes(0));

    // Anyone should be able to call `getUniqueEntity`
    address alice = address(bytes20(keccak256("alice")));
    vm.startPrank(alice);
    uint256 uniqueEntity = uint256(getUniqueEntity(world));

    // Table must have the same entity set
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity);
    // The next entity must be incremented
    assertEq(uint256(getUniqueEntity(world)), uniqueEntity + 1);
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity + 1);

    // But changing the table directly isn't allowed
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: NAMESPACE, name: TABLE_NAME }).toString(),
        alice
      )
    );
    UniqueEntity.set(world, tableId, 123);
  }
}
