// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.13;

import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";
import "memmove/Array.sol";

import { PublicQuadtreeIndexer } from "./public/PublicQuadtreeIndexer.sol";
import { Point, Rectangle, MAX_INT } from "../QuadtreeIndexer.sol";
import { World } from "../World.sol";

import { PositionComponent, Position } from "./components/PositionComponent.sol";

function pointEq(
  Point memory p1,
  int64 x,
  int64 y
) pure returns (bool) {
  return p1.x == x && p1.y == y;
}

contract QuadtreeTest is DSTestPlus {
  using RefArrayLib for Array;

  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  address internal world;
  address deployer = address(1);
  PublicQuadtreeIndexer internal qt;
  PositionComponent internal position;

  function setUp() public {
    vm.startPrank(deployer);
    world = address(new World());
    position = new PositionComponent(world);
    qt = new PublicQuadtreeIndexer(position, 2, 0);
    position.registerIndexer(address(qt));
    vm.stopPrank();
  }

  // Test case from p.29 chapter 01 of Foundations of Multidim. Data Structures
  function testInsert() public {
    uint256 id = 0;
    assertEq(qt.getNode(0).points.length, 0);
    // Chicago and Mobile
    qt.insert(0, Point(35, 42, ++id, 0));
    qt.insert(0, Point(52, 10, ++id, 0));

    // Should be both points in root
    assertEq(qt.getNode(0).points.length, 2);
    assertTrue(pointEq(qt.getPoint(qt.getNode(0).points[0]), 35, 42));
    assertTrue(pointEq(qt.getPoint(qt.getNode(0).points[1]), 52, 10));

    // Toronto and Buffalo
    qt.insert(0, Point(62, 77, ++id, 0));
    qt.insert(0, Point(82, 65, ++id, 0));

    // Should be in the SE quadrant
    assertEq(qt.getNode(qt.getNode(0).children[0]).points.length, 0);
    assertEq(qt.getNode(qt.getNode(0).children[1]).points.length, 0);
    assertEq(qt.getNode(qt.getNode(0).children[2]).points.length, 2);
    assertEq(qt.getNode(qt.getNode(0).children[3]).points.length, 0);

    // Center should be Half of MAX INT
    assertTrue(qt.getNode(qt.getNode(0).children[2]).bounds.cx == int64(MAX_INT) / 2);
    assertTrue(qt.getNode(qt.getNode(0).children[2]).bounds.cy == int64(MAX_INT) / 2);

    // Width and Height should be MAX INT
    assertTrue(qt.getNode(qt.getNode(0).children[2]).bounds.w == MAX_INT);
    assertTrue(qt.getNode(qt.getNode(0).children[2]).bounds.h == MAX_INT);

    // Edges should be (from W, E, N, S): 0, MAX INT, 0, MAX INT
    assertTrue(0 - qt.getNode(qt.getNode(0).children[2]).bounds.westEdge == 0);
    assertTrue(int64(MAX_INT) - qt.getNode(qt.getNode(0).children[2]).bounds.eastEdge <= 1);
    assertTrue(qt.getNode(qt.getNode(0).children[2]).bounds.northEdge == 0);
    assertTrue(int64(MAX_INT) - qt.getNode(qt.getNode(0).children[2]).bounds.southEdge <= 1);

    // Denver and Omaha
    qt.insert(0, Point(5, 45, ++id, 0));
    qt.insert(0, Point(27, 35, ++id, 0));

    // Should be in NW quadrant of SE quadrant
    assertEq(qt.getNode(qt.getNode(qt.getNode(0).children[2]).children[0]).points.length, 2);
    assertEq(qt.getNode(qt.getNode(qt.getNode(0).children[2]).children[1]).points.length, 0);
    assertEq(qt.getNode(qt.getNode(qt.getNode(0).children[2]).children[2]).points.length, 0);
    assertEq(qt.getNode(qt.getNode(qt.getNode(0).children[2]).children[3]).points.length, 0);

    // Atlanta
    qt.insert(0, Point(85, 15, ++id, 0));

    // Should be in NW quadrant of NW quadrant of SE quadrant
    assertEq(qt.getNode(qt.getNode(qt.getNode(qt.getNode(0).children[2]).children[0]).children[0]).points.length, 1);
  }

  function testMultiInsert() public {
    uint256 id = 0;
    int64 start = -10000;
    for (int64 i = start; i < -start; i++) {
      startMeasuringGas("Insert");
      qt.insert(0, Point(i, i, ++id, 0));
      stopMeasuringGas();
    }
  }

  function testRemove() public {
    vm.startPrank(deployer);
    uint256 id = 0;
    qt.insert(0, Point(35, 42, ++id, 0));
    qt.insert(0, Point(52, 10, ++id, 0));

    // Should remove last point
    startMeasuringGas("Remove");
    qt.remove(id);
    stopMeasuringGas();
    assertEq(qt.getNode(0).points.length, 1);
    assertFalse(qt.getPoint(2).entityID > 0);

    // Should replace old point
    qt.insert(0, Point(62, 77, ++id, 0));
    assertEq(qt.getNode(0).points.length, 2);
    assertTrue(pointEq(qt.getPoint(qt.getNode(0).points[1]), 62, 77));
    assertTrue(qt.getPoint(3).entityID > 0);

    qt.insert(0, Point(82, 65, ++id, 0));
    qt.insert(0, Point(5, 45, ++id, 0));
    qt.insert(0, Point(27, 35, ++id, 0));
    qt.insert(0, Point(85, 15, ++id, 0));

    // All node should have points.length 0
    qt.remove(7);
    qt.remove(6);
    qt.remove(5);
    qt.remove(4);
    qt.remove(3);
    qt.remove(1);
    for (uint256 i = 0; i < 9; i++) {
      assertEq(qt.getNode(0).points.length, 0);
    }
    vm.stopPrank();
  }

  function testUpdate() public {
    vm.startPrank(deployer);
    uint256 id = 0;
    qt.insert(0, Point(35, 42, ++id, 0));
    qt.insert(0, Point(52, 10, ++id, 0));
    qt.insert(0, Point(62, 77, ++id, 0));
    qt.insert(0, Point(82, 65, ++id, 0));
    qt.insert(0, Point(5, 45, ++id, 0));
    qt.insert(0, Point(27, 35, ++id, 0));
    qt.insert(0, Point(85, 15, ++id, 0));

    // Should be same location different coordinates
    startMeasuringGas("Update");
    qt.update(id, abi.encode(Point(42, 42, id, 0)));
    assertTrue(
      pointEq(
        qt.getPoint(qt.getNode(qt.getNode(qt.getNode(qt.getNode(0).children[2]).children[0]).children[0]).points[0]),
        42,
        42
      )
    );
    stopMeasuringGas();

    // Should be NW quadrant of first node, other should be empty
    qt.update(id, abi.encode(Point(-42, -42, id, 0)));
    assertEq(qt.getNode(qt.getNode(qt.getNode(qt.getNode(0).children[2]).children[0]).children[0]).points.length, 0);

    assertEq(qt.getNode(qt.getNode(0).children[0]).points.length, 1);
    assertTrue(pointEq(qt.getPoint(qt.getNode(qt.getNode(0).children[0]).points[0]), -42, -42));
    vm.stopPrank();
  }

  function testGetEntitiesWithValue() public {
    uint256 id = 0;
    qt.insert(0, Point(35, 42, ++id, 0));
    qt.insert(0, Point(52, 10, ++id, 0));
    qt.insert(0, Point(62, 77, ++id, 0));
    qt.insert(0, Point(82, 65, ++id, 0));
    qt.insert(0, Point(5, 45, ++id, 0));
    qt.insert(0, Point(27, 35, ++id, 0));
    qt.insert(0, Point(55, 45, ++id, 0));
    qt.insert(0, Point(56, 47, ++id, 0));
    qt.insert(0, Point(55, 50, ++id, 0));
    qt.insert(0, Point(60, 52, ++id, 0));

    Rectangle memory rect = qt.initRectangle(57, 48, 10, 10);
    startMeasuringGas("Query");
    uint256[] memory newFoundPoints = qt.getEntitiesWithValue(abi.encode(rect));
    stopMeasuringGas();
    assertEq(newFoundPoints.length, 4);
    assertTrue(pointEq(qt.getPoint(newFoundPoints[0]), 55, 45));
    assertTrue(pointEq(qt.getPoint(newFoundPoints[1]), 56, 47));
    assertTrue(pointEq(qt.getPoint(newFoundPoints[2]), 55, 50));
    assertTrue(pointEq(qt.getPoint(newFoundPoints[3]), 60, 52));
  }

  function testMultiGetEntitiesWithValue() public {
    uint256 id = 0;
    int64 start = -1000;
    for (int64 i = start; i < -start; i++) {
      qt.insert(0, Point(i, i, ++id, 0));
    }
    for (int64 i = start; i < -start; i++) {
      startMeasuringGas("Query");
      qt.getEntitiesWithValue(abi.encode(qt.initRectangle(i, i, 10, 10)));
      stopMeasuringGas();
    }
  }

  function testCompareBruteForce() public {
    vm.startPrank(address(deployer));
    uint256 id = 0;
    uint256 count = 1000;
    for (uint64 i; i < count; i++) {
      qt.insert(0, Point(int64(i), int64(i), ++id, 0));
      position.set(++id, Position(int64(i), int64(i)));
    }

    // Get all entities in a 10 tile radius around 10,10
    startMeasuringGas("Position Get Entities With Value");
    Array entities = RefArrayLib.newArray(0);
    for (uint64 i = 10; i < 20; i++) {
      for (uint64 j = 10; j < 20; j++) {
        uint256[] memory res = position.getEntitiesWithValue(Position(int64(i), int64(j)));
        for (uint256 k = 0; k < res.length; k++) {
          entities.push(res[k]);
        }
      }
    }
    stopMeasuringGas();

    startMeasuringGas("Query");
    uint256[] memory entityRes = qt.getEntitiesWithValue(abi.encode(qt.initRectangle(10, 10, 10, 10)));
    stopMeasuringGas();

    // *2 because the entities in position are already in qt
    assertEq(entityRes.length, entities.length() * 2);
    vm.stopPrank();
  }

  function testGetEntities() public {
    uint256 id = 0;
    assertFalse(qt.has(1));
    qt.insert(0, Point(35, 42, ++id, 0));
    qt.insert(0, Point(52, 10, ++id, 0));
    qt.insert(0, Point(62, 77, ++id, 0));
    assertTrue(qt.has(1));
    assertTrue(qt.has(2));
    assertTrue(qt.has(3));

    uint256[] memory entities = qt.getEntities();
    assertEq(entities[0], 1);
    assertEq(entities[1], 2);
    assertEq(entities[2], 3);
  }

  function testInsertThroughComponent() public {
    vm.startPrank(address(deployer));
    uint256 id = 0;
    assertEq(qt.getEntities().length, 0);
    position.set(++id, Position(35, 42));
    position.set(++id, Position(52, 10));
    position.set(++id, Position(62, 77));
    position.set(++id, Position(82, 65));
    position.set(++id, Position(5, 45));
    position.set(++id, Position(27, 35));
    position.set(++id, Position(55, 45));
    position.set(++id, Position(56, 47));
    position.set(++id, Position(55, 50));
    position.set(++id, Position(60, 52));

    assertEq(qt.getEntities().length, id);
    id = 0;
    assertTrue(pointEq(qt.getPoint(++id), 35, 42));
    assertTrue(pointEq(qt.getPoint(++id), 52, 10));
    assertTrue(pointEq(qt.getPoint(++id), 62, 77));
    assertTrue(pointEq(qt.getPoint(++id), 82, 65));
    assertTrue(pointEq(qt.getPoint(++id), 5, 45));
    assertTrue(pointEq(qt.getPoint(++id), 27, 35));
    assertTrue(pointEq(qt.getPoint(++id), 55, 45));
    assertTrue(pointEq(qt.getPoint(++id), 56, 47));
    assertTrue(pointEq(qt.getPoint(++id), 55, 50));
    assertTrue(pointEq(qt.getPoint(++id), 60, 52));

    vm.stopPrank();
  }

  function testUpdateThroughComponent() public {
    vm.startPrank(address(deployer));
    uint256 id = 0;
    assertEq(qt.getEntities().length, 0);
    position.set(++id, Position(35, 42));
    position.set(++id, Position(52, 10));

    assertEq(qt.getEntities().length, id);

    assertTrue(pointEq(qt.getPoint(1), 35, 42));

    position.set(1, Position(-42, -42));
    assertTrue(pointEq(qt.getPoint(1), -42, -42));

    vm.stopPrank();
  }

  function testRemoveThroughComponent() public {
    vm.startPrank(address(deployer));
    uint256 id = 0;
    assertEq(qt.getEntities().length, 0);
    position.set(++id, Position(35, 42));
    position.set(++id, Position(52, 10));
    position.set(++id, Position(62, 77));
    position.set(++id, Position(82, 65));
    position.set(++id, Position(5, 45));
    position.set(++id, Position(27, 35));
    position.set(++id, Position(55, 45));
    position.set(++id, Position(56, 47));
    position.set(++id, Position(55, 50));
    position.set(++id, Position(60, 52));

    assertEq(qt.getEntities().length, id);
    for (uint256 i; i <= id; i++) {
      position.remove(i);
    }

    assertEq(qt.getNode(0).points.length, 0);
    assertEq(qt.getEntities().length, 0);
    for (uint256 i; i <= id; i++) {
      assertFalse(qt.has(i));
    }

    vm.stopPrank();
  }
}
