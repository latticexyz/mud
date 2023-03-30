// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";

import { RegistrationModule } from "../src/modules/registration/RegistrationModule.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { UniqueEntityModule } from "../src/modules/uniqueentity/UniqueEntityModule.sol";
import { UniqueEntity } from "../src/modules/uniqueentity/tables/UniqueEntity.sol";
import { getUniqueEntity } from "../src/modules/uniqueentity/getUniqueEntity.sol";

contract UniqueEntityModuleTest is Test {
  IBaseWorld world;
  UniqueEntityModule uniqueEntityModule = new UniqueEntityModule();

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    world.installRootModule(new RegistrationModule(), new bytes(0));
  }

  function testInstall() public {
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    // !gasreport install unique entity module
    world.installRootModule(uniqueEntityModule, new bytes(0));

    // !gasreport get a unique entity nonce
    uint256 uniqueEntity = getUniqueEntity(world);

    // Table must have the same entity set
    assertEq(UniqueEntity.get(world), uniqueEntity);
    // The next entity must be incremented
    assertEq(getUniqueEntity(world), uniqueEntity + 1);
    assertEq(UniqueEntity.get(world), uniqueEntity + 1);
  }
}
