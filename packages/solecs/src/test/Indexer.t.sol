// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vm } from "forge-std/Vm.sol";

import { DamageComponent } from "./components/DamageComponent.sol";
import { PositionComponent, Position } from "./components/PositionComponent.sol";
import { Indexer } from "../Indexer.sol";
import { World } from "../World.sol";
import { Component } from "../Component.sol";

contract IndexerTest is DSTestPlus {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  PositionComponent internal position;
  DamageComponent internal damage;
  Indexer internal regionCreatures;

  function setUp() public {
    address world = address(new World());
    position = new PositionComponent(world);
    damage = new DamageComponent(world);
    Component[] memory components = new Component[](2);
    components[0] = position;
    components[1] = damage;
    bool[] memory track = new bool[](2);
    track[0] = true;
    track[1] = false;
    regionCreatures = new Indexer(components, track);
    position.registerIndexer(address(regionCreatures));
    damage.registerIndexer(address(regionCreatures));
  }

  function testSetAndGetEntitiesWithValue() public {
    assertFalse(regionCreatures.has(1));
    damage.set(1, 1);
    position.set(1, Position(1, 1));

    assertTrue(regionCreatures.has(1));

    position.set(2, Position(1, 1));
    assertFalse(regionCreatures.has(2));

    // Should only give 1
    bytes[] memory content = new bytes[](2);
    content[0] = abi.encode(Position(1, 1));
    bytes memory query = abi.encode(content);

    assertEq(regionCreatures.getEntitiesWithValue(query).length, 1);
    assertEq(regionCreatures.getEntitiesWithValue(query)[0], 1);

    // Should be 2 now
    damage.set(2, 1);
    assertEq(regionCreatures.getEntitiesWithValue(query)[0], 1);
    assertEq(regionCreatures.getEntitiesWithValue(query)[1], 2);
  }

  function testUpdate() public {
    damage.set(1, 1);
    position.set(1, Position(1, 1));

    // Should only give 1
    bytes[] memory content = new bytes[](2);
    content[0] = abi.encode(Position(1, 1));
    bytes memory query = abi.encode(content);

    assertEq(regionCreatures.getEntitiesWithValue(query).length, 1);
    assertEq(regionCreatures.getEntitiesWithValue(query)[0], 1);

    // Update and check query is correct
    position.set(1, Position(2, 2));
    assertEq(regionCreatures.getEntitiesWithValue(query).length, 0);
    content[0] = abi.encode(Position(2, 2));
    query = abi.encode(content);
    assertEq(regionCreatures.getEntitiesWithValue(query)[0], 1);
  }

  function testRemove() public {
    damage.set(1, 1);
    position.set(1, Position(1, 1));

    // Should only give 1
    bytes[] memory content = new bytes[](2);
    content[0] = abi.encode(Position(1, 1));
    bytes memory query = abi.encode(content);

    assertEq(regionCreatures.getEntitiesWithValue(query).length, 1);
    assertEq(regionCreatures.getEntitiesWithValue(query)[0], 1);

    // Should be gone from indexer after removal
    damage.remove(1);
    assertEq(regionCreatures.getEntitiesWithValue(query).length, 0);
  }

  function testGetEntities() public {
    damage.set(1, 1);
    position.set(1, Position(1, 1));
    position.set(2, Position(1, 1));
    damage.set(2, 1);

    uint256[] memory entities = regionCreatures.getEntities();
    assertEq(entities[0], 1);
    assertEq(entities[1], 2);
  }
}
