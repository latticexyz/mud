// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";

import { World } from "../World.sol";
import { LibQuery } from "../LibQuery.sol";
import { QueryFragment, QueryType } from "../interfaces/Query.sol";
import { TestComponent1, TestComponent2, TestComponent3 } from "./components/TestComponent.sol";
import { PrototypeTagComponent } from "./components/PrototypeTagComponent.sol";
import { FromPrototypeComponent } from "./components/FromPrototypeComponent.sol";
import { OwnedByEntityComponent } from "./components/OwnedByEntityComponent.sol";

contract LibQueryTest is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  address payable[] internal users;

  TestComponent1 internal component1;
  TestComponent2 internal component2;
  TestComponent3 internal component3;

  PrototypeTagComponent internal prototypeTag;
  FromPrototypeComponent internal fromPrototype;
  OwnedByEntityComponent internal ownedByEntity;

  function setUp() public {
    World world = new World();
    world.init();
    component1 = new TestComponent1(address(world));
    component2 = new TestComponent2(address(world));
    component3 = new TestComponent3(address(world));
    prototypeTag = new PrototypeTagComponent(address(world));
    fromPrototype = new FromPrototypeComponent(address(world));
    ownedByEntity = new OwnedByEntityComponent(address(world));
  }

  function testHasQuery() public {
    component1.set(1, abi.encode(1));
    component1.set(2, abi.encode(1));
    component2.set(1, abi.encode(0));
    // Query should return all entities that have component1
    QueryFragment[] memory fragments = new QueryFragment[](1);
    // The value argument is ignored in for Has query fragments
    fragments[0] = QueryFragment(QueryType.Has, component1, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 1);
    assertTrue(entities[1] == 2);
  }

  function testHasValueQuery() public {
    component1.set(1, abi.encode(2));
    component1.set(2, abi.encode(1));
    component1.set(3, abi.encode(1));
    // Query should return all entities that have component1 with value 1
    QueryFragment[] memory fragments = new QueryFragment[](1);
    fragments[0] = QueryFragment(QueryType.HasValue, component1, abi.encode(1));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 2);
    assertTrue(entities[1] == 3);
  }

  function testCombinedHasQuery() public {
    component1.set(1, abi.encode(2));
    component1.set(2, abi.encode(1));
    component1.set(3, abi.encode(1));
    component2.set(2, abi.encode(1));
    component2.set(3, abi.encode(1));
    component3.set(1, abi.encode(1));

    // Query should return all entities that have component1 and component2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, component1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.Has, component2, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 2);
    assertTrue(entities[1] == 3);
  }

  function testCombinedHasValueQuery() public {
    component1.set(1, abi.encode(2));
    component1.set(2, abi.encode(2));
    component1.set(3, abi.encode(1));
    component2.set(2, abi.encode(1));
    component2.set(3, abi.encode(1));
    component3.set(1, abi.encode(1));

    // Query should return all entities that have component1 and component2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.HasValue, component1, abi.encode(1));
    fragments[1] = QueryFragment(QueryType.HasValue, component2, abi.encode(1));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 3);
  }

  function testCombinedHasHasValueQuery() public {
    component1.set(1, abi.encode(1));
    component1.set(2, abi.encode(1));
    component1.set(3, abi.encode(1));
    component2.set(1, abi.encode(1));
    component2.set(2, abi.encode(2));
    component2.set(3, abi.encode(2));
    component2.set(4, abi.encode(2));

    // Query should return all entities that have component1 and component2
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, component1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.HasValue, component2, abi.encode(2));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 2);
    assertTrue(entities[1] == 3);
  }

  function testCombinedHasNotQuery() public {
    component1.set(1, abi.encode(1));
    component1.set(2, abi.encode(1));
    component1.set(3, abi.encode(1));
    component2.set(1, abi.encode(1));
    component2.set(2, abi.encode(2));
    component2.set(3, abi.encode(2));
    component2.set(4, abi.encode(2));

    // Query should return all entities that have component2 and not component1
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, component2, new bytes(0));
    fragments[1] = QueryFragment(QueryType.Not, component1, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 4);
  }

  function testCombinedHasValueNotQuery() public {
    component1.set(1, abi.encode(1));
    component1.set(2, abi.encode(1));
    component1.set(3, abi.encode(1));
    component2.set(1, abi.encode(1));
    component2.set(2, abi.encode(2));
    component2.set(3, abi.encode(1));
    component2.set(4, abi.encode(1));

    // Query should return all entities that have component2 and not component1
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.HasValue, component2, abi.encode(1));
    fragments[1] = QueryFragment(QueryType.Not, component1, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 4);
  }

  function testCombinedHasHasValueNotQuery() public {
    component1.set(1, abi.encode(1));
    component1.set(2, abi.encode(1));
    component1.set(3, abi.encode(1));
    component2.set(1, abi.encode(1));
    component2.set(2, abi.encode(2));
    component2.set(3, abi.encode(1));
    component2.set(4, abi.encode(1));
    component3.set(2, abi.encode(1));
    component3.set(3, abi.encode(1));
    component3.set(4, abi.encode(1));

    // Query should return all entities that have component2 and not component1
    QueryFragment[] memory fragments = new QueryFragment[](3);
    fragments[0] = QueryFragment(QueryType.Has, component1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.HasValue, component2, abi.encode(1));
    fragments[2] = QueryFragment(QueryType.Not, component3, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 1);
  }

  function testNotValueQuery() public {
    component1.set(1, abi.encode(4));
    component1.set(2, abi.encode(5));
    component1.set(3, abi.encode(6));

    // Query should return all entities with component 1 except value 6
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.Has, component1, new bytes(0));
    fragments[1] = QueryFragment(QueryType.NotValue, component1, abi.encode(6));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 1);
    assertTrue(entities[1] == 2);
  }

  function testInitialProxyExpand() public {
    // 1 is a prototype entity and has component1
    prototypeTag.set(1, new bytes(0));
    component1.set(1, abi.encode(1));

    // 2 is an instance of prototype 1
    fromPrototype.set(2, 1);

    // Query should return all entities with component1, including instances
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.ProxyExpand, fromPrototype, abi.encode(1));
    fragments[1] = QueryFragment(QueryType.Has, component1, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 1);
    assertTrue(entities[1] == 2);
  }

  function testDeepProxyExpand() public {
    // 1 is an instance with component1
    component1.set(1, abi.encode(1));

    // 2 is owned by 1
    ownedByEntity.set(2, 1);

    // 3 is owned by 1
    ownedByEntity.set(3, 1);

    // 4 is owned by 2
    ownedByEntity.set(4, 2);

    // 5 is owned by 4
    ownedByEntity.set(5, 4);

    // 6 is owned by 3
    ownedByEntity.set(6, 3);

    // 42 is owned by 69
    ownedByEntity.set(42, 69);

    // Query should return all entities owned by 1
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.ProxyExpand, ownedByEntity, abi.encode(0xff)); // Depth of 256 should be enough
    fragments[1] = QueryFragment(QueryType.Has, component1, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);

    assertTrue(entities.length == 6);
    assertTrue(entities[0] == 1);
    assertTrue(entities[1] == 5);
    assertTrue(entities[2] == 4);
    assertTrue(entities[3] == 6);
    assertTrue(entities[4] == 2);
    assertTrue(entities[5] == 3);
  }

  function testProxyRead() public {
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
    QueryFragment[] memory fragments = new QueryFragment[](3);
    fragments[0] = QueryFragment(QueryType.ProxyRead, fromPrototype, abi.encode(1));
    fragments[1] = QueryFragment(QueryType.Has, component3, new bytes(0)); // interim result 4,5,6
    fragments[2] = QueryFragment(QueryType.Has, component1, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);
    assertTrue(entities.length == 2);
    assertTrue(entities[0] == 4);
    assertTrue(entities[1] == 5);

    // Gimme all entities with component3 and component2
    fragments[2] = QueryFragment(QueryType.Has, component2, new bytes(0));
    entities = LibQuery.query(fragments);
    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 6);

    // Gimme all entities with component3 and component1 value 1
    fragments[2] = QueryFragment(QueryType.HasValue, component1, abi.encode(1));
    entities = LibQuery.query(fragments);
    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 4);
  }

  function testDeepProxyRead() public {
    component1.set(1, abi.encode(1));
    ownedByEntity.set(2, 1);
    ownedByEntity.set(3, 2);
    ownedByEntity.set(4, 3);
    ownedByEntity.set(5, 4);
    ownedByEntity.set(6, 5);

    component1.set(7, abi.encode(2));
    ownedByEntity.set(8, 7);

    // Gimme all entities owned by an entity with component1 value 1
    QueryFragment[] memory fragments = new QueryFragment[](5);
    fragments[0] = QueryFragment(QueryType.ProxyRead, ownedByEntity, abi.encode(0xff)); // Depth 255
    fragments[1] = QueryFragment(QueryType.Has, ownedByEntity, new bytes(0));
    fragments[2] = QueryFragment(QueryType.HasValue, component1, abi.encode(1));
    fragments[3] = QueryFragment(QueryType.ProxyRead, ownedByEntity, abi.encode(0)); // Turn off proxy read
    fragments[4] = QueryFragment(QueryType.NotValue, component1, abi.encode(1)); // Exclude entities having component1 value 1 themselves
    uint256[] memory entities = LibQuery.query(fragments);
    assertTrue(entities.length == 5);
    assertTrue(entities[0] == 2);
    assertTrue(entities[1] == 3);
    assertTrue(entities[2] == 4);
    assertTrue(entities[3] == 5);
    assertTrue(entities[4] == 6);

    // Gimme all entities owned by an entity with component1 value 2
    fragments[2] = QueryFragment(QueryType.HasValue, component1, abi.encode(2));
    fragments[3] = QueryFragment(QueryType.ProxyRead, ownedByEntity, abi.encode(0)); // Turn off proxy read
    fragments[4] = QueryFragment(QueryType.NotValue, component1, abi.encode(2)); // Exclude entities having component1 value 1 themselves
    entities = LibQuery.query(fragments);
    assertTrue(entities.length == 1);
    assertTrue(entities[0] == 8);
  }

  function testGetValueWithProxy() public {
    component1.set(1, abi.encode(1));
    ownedByEntity.set(2, 1);
    ownedByEntity.set(3, 2);
    ownedByEntity.set(4, 3);
    ownedByEntity.set(5, 4);
    ownedByEntity.set(6, 5);

    (bytes memory value, bool found) = LibQuery.getValueWithProxy(component1, 1, ownedByEntity, 0);
    assertTrue(found);
    assertTrue(abi.decode(value, (uint256)) == 1);

    (value, found) = LibQuery.getValueWithProxy(component1, 6, ownedByEntity, 5);
    assertTrue(found);
    assertTrue(abi.decode(value, (uint256)) == 1);

    (value, found) = LibQuery.getValueWithProxy(component1, 6, ownedByEntity, 4);
    assertTrue(!found);
    assertTrue(value.length == 0);
  }
}
