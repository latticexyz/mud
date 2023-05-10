// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { TemplatesModule } from "../src/modules/templates/TemplatesModule.sol";

import { NAMESPACE, TABLE_NAME } from "../src/modules/uniqueentity/constants.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

contract TemplatesModuleTest is Test {
  using ResourceSelector for bytes32;

  IBaseWorld world;
  TemplatesModule templatesModule = new TemplatesModule();

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
  }

  function testInstallRoot() public {
    // !gasreport install templates module
    world.installRootModule(templatesModule, new bytes(0));
  }
}
