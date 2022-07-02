// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { World } from "solecs/World.sol";
import { Utilities } from "../utils/Utilities.sol";
import { PositionComponent, Coord } from "../../components/PositionComponent.sol";

contract PositionComponentTest is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  Utilities internal utils;
  address payable[] internal users;

  PositionComponent internal position;

  function setUp() public {
    position = new PositionComponent(address(new World()));
  }

  function testSetAndGetValue() public {
    assertTrue(!position.has(1));
    position.set(1, Coord({ x: 1, y: 2 }));
    assertTrue(position.has(1));
    Coord memory pos1 = position.getValue(1);
    assertEq(pos1.x, 1);
    assertEq(pos1.y, 2);

    position.set(1, Coord({ x: 2, y: 2 }));
    position.set(2, Coord({ x: 2, y: 1 }));
    assertTrue(position.has(1));
    assertTrue(position.has(2));

    pos1 = position.getValue(1);
    assertEq(pos1.x, 2);
    assertEq(pos1.y, 2);

    Coord memory pos2 = position.getValue(2);
    assertEq(pos2.x, 2);
    assertEq(pos2.y, 1);
  }

  function testRemove() public {
    assertTrue(!position.has(1));
    position.set(1, Coord({ x: 2, y: 1 }));
    assertTrue(position.has(1));
    position.remove(1);
    assertTrue(!position.has(1));
  }

  function testGetEntities() public {
    position.set(1, Coord({ x: 1, y: 1 }));
    position.set(2, Coord({ x: 4, y: 7 }));
    position.set(3, Coord({ x: 7, y: 8 }));

    uint256[] memory entities = position.getEntities();
    assertEq(entities.length, 3);
    assertEq(entities[0], 1);
    assertEq(entities[1], 2);
    assertEq(entities[2], 3);
  }

  function testGetEntitiesWithValue() public {
    position.set(1, Coord({ x: 1, y: 1 }));
    position.set(2, Coord({ x: 1, y: 1 }));
    position.set(3, Coord({ x: 7, y: 8 }));

    uint256[] memory entities = position.getEntitiesWithValue(Coord({ x: 1, y: 1 }));
    assertEq(entities.length, 2);
    assertEq(entities[0], 1);
    assertEq(entities[1], 2);

    entities = position.getEntitiesWithValue(Coord({ x: 7, y: 8 }));
    assertEq(entities.length, 1);
    assertEq(entities[0], 3);

    entities = position.getEntitiesWithValue(Coord({ x: 7, y: 1 }));
    assertEq(entities.length, 0);
  }
}
