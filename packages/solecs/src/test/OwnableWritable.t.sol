// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";

import { IOwnableInternal } from "@solidstate/contracts/access/ownable/IOwnableInternal.sol";
import { OwnableWritable } from "../OwnableWritable.sol";

import { TestComponent } from "./components/TestComponent.sol";
import { TestSubsystem } from "./systems/TestSubsystem.sol";
import { World } from "../World.sol";

contract OwnableWritableTest is DSTestPlus {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  address payable[] internal users;

  address writer = address(bytes20(keccak256("writer")));
  address notWriter = address(bytes20(keccak256("notWriter")));

  TestComponent internal component;
  TestSubsystem internal subsystem;

  function setUp() public {
    World world = new World();
    world.init();

    component = new TestComponent(address(world));
    subsystem = new TestSubsystem(world, address(world.components()));

    component.authorizeWriter(writer);
    subsystem.authorizeWriter(writer);
  }

  function testWriteAccess() public {
    assertTrue(component.writeAccess(writer));
    assertTrue(subsystem.writeAccess(writer));
    // owner also counts as a writer
    assertTrue(component.writeAccess(address(this)));
    assertTrue(subsystem.writeAccess(address(this)));
  }

  function testNoWriteAccess() public {
    assertFalse(component.writeAccess(notWriter));
    assertFalse(subsystem.writeAccess(notWriter));
  }

  function testWriterCanWrite() public {
    vm.startPrank(writer);

    component.set(1, abi.encode(1));
    assertTrue(component.has(1));

    assertEq(abi.decode(subsystem.execute(abi.encode(1)), (uint256)), 1);
  }

  function testNotWriterCanNotWrite() public {
    vm.startPrank(notWriter);

    vm.expectRevert(OwnableWritable.OwnableWritable__NotWriter.selector);
    component.set(1, abi.encode(1));

    vm.expectRevert(OwnableWritable.OwnableWritable__NotWriter.selector);
    subsystem.execute(abi.encode(1));
  }

  function testWriterCanNotAuthorize() public {
    vm.startPrank(writer);

    vm.expectRevert(IOwnableInternal.Ownable__NotOwner.selector);
    component.authorizeWriter(notWriter);

    vm.expectRevert(IOwnableInternal.Ownable__NotOwner.selector);
    component.unauthorizeWriter(writer);
  }

  function testUnauthorizeWriter() public {
    component.unauthorizeWriter(writer);
    subsystem.unauthorizeWriter(writer);

    vm.startPrank(writer);

    assertFalse(component.writeAccess(writer));
    assertFalse(subsystem.writeAccess(writer));

    vm.expectRevert(OwnableWritable.OwnableWritable__NotWriter.selector);
    component.set(1, abi.encode(1));

    vm.expectRevert(OwnableWritable.OwnableWritable__NotWriter.selector);
    subsystem.execute(abi.encode(1));
  }
}
