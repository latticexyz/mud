// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";

import { World, WorldQueryFragment } from "../World.sol";
import { LibQuery } from "../LibQuery.sol";
import { QueryFragment, QueryType } from "../interfaces/Query.sol";
import { TestComponent1, TestComponent2, TestComponent3 } from "./components/TestComponent.sol";
import { PrototypeTagComponent } from "./components/PrototypeTagComponent.sol";
import { FromPrototypeComponent } from "./components/FromPrototypeComponent.sol";
import { OwnedByEntityComponent } from "./components/OwnedByEntityComponent.sol";

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
    address worldAddress = address(world);
    component1 = new TestComponent1(worldAddress);
    component2 = new TestComponent2(worldAddress);
    component3 = new TestComponent3(worldAddress);
    prototypeTag = new PrototypeTagComponent(worldAddress);
    fromPrototype = new FromPrototypeComponent(worldAddress);
    ownedByEntity = new OwnedByEntityComponent(worldAddress);
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
    fragments[0] = WorldQueryFragment(QueryType.ProxyRead, fromPrototype.id(), abi.encode(1));
    fragments[1] = WorldQueryFragment(QueryType.Has, component3.id(), new bytes(0)); // interim result 4,5,6
    fragments[2] = WorldQueryFragment(QueryType.Has, component1.id(), new bytes(0));
    uint256[] memory entities = world.query(fragments);
    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 4);
    assertTrue(entities[1] == 5);

    // Gimme all entities with component3 and component2
    fragments[2] = WorldQueryFragment(QueryType.Has, component2.id(), new bytes(0));
    entities = world.query(fragments);
    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 6);

    // Gimme all entities with component3 and component1 value 1
    fragments[2] = WorldQueryFragment(QueryType.HasValue, component1.id(), abi.encode(1));
    entities = world.query(fragments);
    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 4);
  }
}
