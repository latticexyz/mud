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
import { aSystem, ASystemThing } from "../src/namespaces/a/codegen/systems/ASystemLib.sol";
import { bSystem } from "../src/namespaces/b/codegen/systems/BSystemLib.sol";
import { rootSystem } from "../src/namespaces/root/codegen/systems/RootSystemLib.sol";
import { PositionValue } from "../src/namespaces/a/codegen/tables/PositionValue.sol";
import { Position } from "../src/namespaces/a/ASystemTypes.sol";

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

  function testCanCallSystemWithComplexArgumentTypes() public {
    Position memory position = Position(1, 2, 3);
    aSystem.setPosition(position);
    assertEq(PositionValue.getX(), position.x);
    assertEq(PositionValue.getY(), position.y);
    assertEq(PositionValue.getZ(), position.z);

    aSystem.setPosition(1, 2, 3);
    assertEq(PositionValue.getX(), 1);
    assertEq(PositionValue.getY(), 2);
    assertEq(PositionValue.getZ(), 3);

    Position[] memory positions = new Position[](2);
    positions[0] = Position(1, 2, 3);
    positions[1] = Position(4, 5, 6);
    aSystem.setPositions(positions);
    assertEq(PositionValue.getX(), 4);
    assertEq(PositionValue.getY(), 5);
    assertEq(PositionValue.getZ(), 6);

    aSystem.setValuesStaticArray([uint256(1)]);
    assertEq(Value.get(), 1);
    aSystem.setValuesStaticArray([uint256(1), 2]);
    assertEq(Value.get(), 2);
    aSystem.setValuesStaticArray([uint256(1), 2, 3]);
    assertEq(Value.get(), 3);

    bytes memory bytesArgument = "test bytes";
    (, bytes memory bytesResult, ) = aSystem.setWithNamelessParameters(
      payable(0),
      bytesArgument,
      bytesArgument,
      new string[](0)
    );
    assertEq(bytesResult, bytesArgument);
  }

  function testCanCallSystemFromOtherSystem() public {
    uint256 value = 0xDEADBEEF;
    ASystemThing memory thing = ASystemThing(value);
    bSystem.setValueInA(thing);
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
    ASystemThing memory thing = ASystemThing(value);
    // internally, rootSystem uses callAsRoot to call aSystem
    rootSystem.setValueInA(thing);
    assertEq(Value.get(), value);
    assertEq(aSystem.getValue(), value);
    assertEq(rootSystem.getValueFromA(), value);
  }

  function testCanExpectRevert() public {
    vm.expectRevert("reverted successfully");
    aSystem.getValueWithRevert();

    vm.expectRevert("reverted successfully");
    aSystem.setAddressWithRevert();
  }
}
