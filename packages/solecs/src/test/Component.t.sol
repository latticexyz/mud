// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";

import { TestComponent } from "./components/TestComponent.sol";
import { World } from "../World.sol";

contract ComponentTest is DSTestPlus {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  address payable[] internal users;

  TestComponent internal component;

  function setUp() public {
    World world = new World();
    world.init();
    component = new TestComponent(address(world));
  }

  function testSetAndGetValue() public {
    assertTrue(!component.has(1));
    component.set(1, abi.encode(1));
    assertTrue(component.has(1));
    assertEq(abi.decode(component.getRawValue(1), (uint256)), 1);

    component.set(1, abi.encode(2));
    component.set(2, abi.encode(4));
    assertTrue(component.has(1));
    assertTrue(component.has(2));
    assertEq(abi.decode(component.getRawValue(1), (uint256)), 2);
    assertEq(abi.decode(component.getRawValue(2), (uint256)), 4);
  }

  function testRemove() public {
    assertTrue(!component.has(1));
    component.set(1, abi.encode(1));
    assertTrue(component.has(1));
    component.remove(1);
    assertTrue(!component.has(1));
  }

  function testGetEntities() public {
    component.set(1, abi.encode(2));
    component.set(2, abi.encode(4));
    component.set(3, abi.encode(10));

    uint256[] memory entities = component.getEntities();
    assertEq(entities[0], 1);
    assertEq(entities[1], 2);
    assertEq(entities[2], 3);
  }

  function testGetEntitiesWithValue() public {
    component.set(1, abi.encode(1));
    component.set(2, abi.encode(1));
    component.set(3, abi.encode(2));

    uint256[] memory entities = component.getEntitiesWithValue(abi.encode(1));
    assertEq(entities.length, 2);
    assertEq(entities[0], 1);
    assertEq(entities[1], 2);

    entities = component.getEntitiesWithValue(abi.encode(2));
    assertEq(entities.length, 1);
    assertEq(entities[0], 3);

    entities = component.getEntitiesWithValue(abi.encode(3));
    assertEq(entities.length, 0);
  }
}
