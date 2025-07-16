// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console } from "forge-std/console.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { someProgram } from "../src/namespaces/root/codegen/systems/SomeProgramLib.sol";
import { someAbstractProgram } from "../src/namespaces/root/codegen/systems/SomeAbstractProgramLib.sol";

contract SystemsTest is MudTest {
  function testInheritsBaseSystem() public {
    // should deploy contracts inheriting base system
    assertTrue(ResourceIds.get(someProgram.toResourceId()));
    // but not abstract ones
    assertFalse(ResourceIds.get(someAbstractProgram.toResourceId()));
  }
}
