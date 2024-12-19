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
import { NameValue } from "../src/namespaces/a/codegen/tables/NameValue.sol";
import { aSystem, ASystemThing, ASystemThing2 } from "../src/namespaces/a/codegen/systems/ASystemLib.sol";
import { bSystem } from "../src/namespaces/b/codegen/systems/BSystemLib.sol";
import { rootSystem } from "../src/namespaces/root/codegen/systems/RootSystemLib.sol";

contract LibrariesTest is MudTest {
  function testNamespaceIdExists() public {
    assertTrue(ResourceIds.get(aSystem.toResourceId()));
    assertTrue(ResourceIds.get(bSystem.toResourceId()));
  }

  function testCanCallSystemWithLibrary() public {
    uint256 value = 0xDEADBEEF;
    ASystemThing memory thing = ASystemThing(value);
    aSystem.setValue(thing);
    assertEq(Value.get(), value);
    assertEq(aSystem.getValue(), value);
  }

  function testCanCallSystemFromOtherSystem() public {
    uint256 value = 0xDEADBEEF;
    ASystemThing memory thing = ASystemThing(value);
    bSystem.setValueInA(thing);
    assertEq(Value.get(), value);
    assertEq(bSystem.getValueFromA(), value);
  }

  function testCanCallSystemWithComplexStruct() public {
    ASystemThing2 memory thing = ASystemThing2(1, 2, 3);
    aSystem.setComplexValue(thing, "test");
    assertEq(Value.get(), 1, "Value should be 1");
    assertEq(NameValue.get(), "test", "NameValue should be test");
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
    ASystemThing memory thing = ASystemThing(value);
    // internally, rootSystem uses callAsRoot to call aSystem
    rootSystem.setValueInA(thing);
    assertEq(Value.get(), value);
    assertEq(aSystem.getValue(), value);
    assertEq(rootSystem.getValueFromA(), value);
  }
}
