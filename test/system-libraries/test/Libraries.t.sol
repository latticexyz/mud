// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ResourceIds } from "@latticexyz/store/src/codegen/index.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { Value } from "../src/namespaces/a/codegen/tables/Value.sol";
import { aSystem } from "../src/namespaces/a/codegen/libraries/ASystemLib.sol";
import { bSystem } from "../src/namespaces/b/codegen/libraries/BSystemLib.sol";

contract LibrariesTest is MudTest {
  function testNamespaceIdExists() public {
    assertTrue(ResourceIds.get(aSystem.toResourceId()));
    assertTrue(ResourceIds.get(bSystem.toResourceId()));
  }

  function testCanCallSystemWithLibrary() public {
    uint256 value = 0xDEADBEEF;
    aSystem.setValue(value);
    assertEq(Value.get(), value);
  }

  function testCanCallSystemFromOtherSystem() public {
    uint256 value = 0xDEADBEEF;
    bSystem.setValueInA(value);
    assertEq(Value.get(), value, "Value.get");
    assertEq(bSystem.getValueFromA(), value, "getValueFromA");
  }
}
