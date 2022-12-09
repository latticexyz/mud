// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";

import { World, WorldQueryFragment } from "../World.sol";
import { LibQuery } from "../LibQuery.sol";
import { QueryFragment, QueryType } from "../interfaces/Query.sol";
import { TestComponent1, TestComponent1ID, TestComponent2, TestComponent2ID, TestComponent3, TestComponent3ID } from "./components/TestComponent.sol";
import { PrototypeTagComponent, ID as PrototypeTagComponentID } from "./components/PrototypeTagComponent.sol";
import { FromPrototypeComponent, ID as FromPrototypeComponentID } from "./components/FromPrototypeComponent.sol";
import { OwnedByEntityComponent, ID as OwnedByEntityComponentID } from "./components/OwnedByEntityComponent.sol";

contract WorldTest is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  address payable[] internal users;

  World internal world;

  TestComponent1 internal component1;
  TestComponent2 internal component2;
  TestComponent3 internal component3;

  PrototypeTagComponent internal prototypeTag;
  FromPrototypeComponent internal fromPrototype;
  OwnedByEntityComponent internal ownedByEntity;

  function setUp() public {
    world = new World();
    world.init();

    component1 = new TestComponent1(world);
    component2 = new TestComponent2(world);
    component3 = new TestComponent3(world);
    prototypeTag = new PrototypeTagComponent(world);
    fromPrototype = new FromPrototypeComponent(world);
    ownedByEntity = new OwnedByEntityComponent(world);

    world.registerComponent(address(component1), TestComponent1ID);
    world.registerComponent(address(component2), TestComponent2ID);
    world.registerComponent(address(component3), TestComponent3ID);
    world.registerComponent(address(prototypeTag), PrototypeTagComponentID);
    world.registerComponent(address(fromPrototype), FromPrototypeComponentID);
    world.registerComponent(address(ownedByEntity), OwnedByEntityComponentID);
  }

  function testQuery() public {
    // 1 is a prototype with component1 value 1
    prototypeTag.set(1, new bytes(0));
    component1.set(1, abi.encode(1));

    // 2 is a prototype with component1 value 2
    prototypeTag.set(2, new bytes(0));
    component1.set(2, abi.encode(2));

    // 3 is a prototype with component2 value 1
    prototypeTag.set(3, new bytes(0));
    component2.set(3, abi.encode(1));

    // 4 is an instance of 1 and has component 3
    fromPrototype.set(4, 1);
    component3.set(4, abi.encode(1));

    // 5 is an instance of 2 and has component 3
    fromPrototype.set(5, 2);
    component3.set(5, abi.encode(1));

    // 6 is an instace of 3 and has component 3
    fromPrototype.set(6, 3);
    component3.set(6, abi.encode(1));

    // Gimme all entities with component3 and component1
    WorldQueryFragment[] memory fragments = new WorldQueryFragment[](3);
    fragments[0] = WorldQueryFragment(QueryType.ProxyRead, FromPrototypeComponentID, abi.encode(1));
    fragments[1] = WorldQueryFragment(QueryType.Has, TestComponent3ID, new bytes(0)); // interim result 4,5,6
    fragments[2] = WorldQueryFragment(QueryType.Has, TestComponent1ID, new bytes(0));
    uint256[] memory entities = world.query(fragments);
    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 4);
    assertTrue(entities[1] == 5);

    // Gimme all entities with component3 and component2
    fragments[2] = WorldQueryFragment(QueryType.Has, TestComponent2ID, new bytes(0));
    entities = world.query(fragments);
    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 6);

    // Gimme all entities with component3 and component1 value 1
    fragments[2] = WorldQueryFragment(QueryType.HasValue, TestComponent1ID, abi.encode(1));
    entities = world.query(fragments);
    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 4);
  }
}
