// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console } from "forge-std/console.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/index.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { SystemboundDelegationControl } from "@latticexyz/world-modules/src/modules/std-delegations/SystemboundDelegationControl.sol";
import { SYSTEMBOUND_DELEGATION } from "@latticexyz/world-modules/src/modules/std-delegations/StandardDelegationsModule.sol";

import { Value } from "../src/namespaces/a/codegen/tables/Value.sol";
import { AddressValue } from "../src/namespaces/a/codegen/tables/AddressValue.sol";
import { aSystem } from "../src/namespaces/a/codegen/libraries/ASystemLib.sol";
import { bSystem } from "../src/namespaces/b/codegen/libraries/BSystemLib.sol";
import { rootSystem } from "../src/namespaces/root/codegen/libraries/RootSystemLib.sol";

contract LibrariesTest is MudTest {
  function testNamespaceIdExists() public {
    assertTrue(ResourceIds.get(aSystem.toResourceId()));
    assertTrue(ResourceIds.get(bSystem.toResourceId()));
  }

  function testCanCallSystemWithLibrary() public {
    uint256 value = 0xDEADBEEF;
    aSystem.setValue(value);
    assertEq(Value.get(), value);
    assertEq(aSystem.getValue(), value);
  }

  function testCanCallSystemFromOtherSystem() public {
    uint256 value = 0xDEADBEEF;
    bSystem.setValueInA(value);
    assertEq(Value.get(), value);
    assertEq(bSystem.getValueFromA(), value);
  }

  function testCallFrom() public {
    address alice = address(0xDEADBEEF);

    // Alice delegates control to the test contract to call the aSystem on her behalf
    vm.prank(alice);
    IBaseWorld(worldAddress).registerDelegation(
      address(this),
      SYSTEMBOUND_DELEGATION,
      abi.encodeCall(SystemboundDelegationControl.initDelegation, (address(this), aSystem.toResourceId(), 2))
    );

    address sender = aSystem.callFrom(alice).setAddress();
    assertEq(sender, alice);
    assertEq(AddressValue.get(), alice);
  }

  function testCanCallFromRootSystemWithLibrary() public {
    uint256 value = 0xDEADBEEF;
    // internally, rootSystem uses callAsRoot to call aSystem
    rootSystem.setValueInA(value);
    assertEq(Value.get(), value);
    assertEq(aSystem.getValue(), value);
  }
}
