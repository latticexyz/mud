// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IErrors } from "../src/interfaces/IErrors.sol";

import { RegistrationModule } from "../src/modules/registration/RegistrationModule.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { UniqueEntityModule } from "../src/modules/uniqueentity/UniqueEntityModule.sol";
import { UniqueEntity } from "../src/modules/uniqueentity/tables/UniqueEntity.sol";
import { getUniqueEntity } from "../src/modules/uniqueentity/getUniqueEntity.sol";

import { NAMESPACE, TABLE_NAME } from "../src/modules/uniqueentity/constants.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

contract UniqueEntityModuleTest is Test {
  using ResourceSelector for bytes32;

  IBaseWorld world;
  UniqueEntityModule uniqueEntityModule = new UniqueEntityModule();
  uint256 tableId = uint256(ResourceSelector.from(NAMESPACE, TABLE_NAME));

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    world.installRootModule(new RegistrationModule(), new bytes(0));
  }

  function testInstall() public {
    // !gasreport install unique entity module
    world.installModule(uniqueEntityModule, new bytes(0));

    // !gasreport get a unique entity nonce (non-root module)
    uint256 uniqueEntity = uint256(getUniqueEntity(world));

    // Table must have the same entity set
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity);
    // The next entity must be incremented
    assertEq(uint256(getUniqueEntity(world)), uniqueEntity + 1);
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity + 1);
  }

  function testInstallRoot() public {
    // !gasreport installRoot unique entity module
    world.installRootModule(uniqueEntityModule, new bytes(0));

    // !gasreport get a unique entity nonce (root module)
    uint256 uniqueEntity = uint256(getUniqueEntity(world));

    // Table must have the same entity set
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity);
    // The next entity must be incremented
    assertEq(uint256(getUniqueEntity(world)), uniqueEntity + 1);
    assertEq(UniqueEntity.get(world, tableId), uniqueEntity + 1);
  }

  function testPublicAccess() public {
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
        IErrors.AccessDenied.selector,
        ResourceSelector.from(NAMESPACE, TABLE_NAME).toString(),
        alice
      )
    );
    UniqueEntity.set(world, tableId, 123);
  }
}
