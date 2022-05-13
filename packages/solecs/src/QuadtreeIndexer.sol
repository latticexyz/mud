// SPDX-License-Identifier: Unlicense
// Implementation adjusted to solidity from https://scipython.com/blog/quadtrees-2-implementation-in-python/
pragma solidity >=0.8.13 <0.9.0;
import { console } from "forge-std/console.sol";
import "memmove/Array.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import { Set } from "./Set.sol";
import { Component } from "./Component.sol";

import { IEntityIndexer } from "./interfaces/IEntityIndexer.sol";

struct Point {
  int64 x;
  int64 y;
  uint256 entityID;
  uint256 parentNode;
}

struct Rectangle {
  int64 cx;
  int64 cy;
  uint64 w;
  uint64 h;
  int64 westEdge;
  int64 eastEdge;
  int64 northEdge;
  int64 southEdge;
}

struct Node {
  uint32 maxPoints;
  uint32 depth;
  uint256[] points;
  uint256[] children; // 0: nw, 1: ne, 2: se, 3: sw
  Rectangle bounds;
  bool divided;
}

uint64 constant MAX_INT = 2**32 - 1;

contract QuadtreeIndexer is IERC165, IEntityIndexer {
  using RefArrayLib for Array;
  Set private entities;
  Component private component;
  mapping(uint256 => Node) private nodes; // NodeID -> Node
  mapping(uint256 => Point) private points; // EntityID -> Point
  uint256 private root;
  uint256 private nodeID;

  modifier correctComponentCaller() {
    require(msg.sender == address(component), "Quadtree does not index caller component!");
    _;
  }

  constructor(
    Component _component,
    uint32 maxPoints,
    uint32 depth
  ) {
    nodeID = 0;
    root = nodeID;
    nodes[nodeID] = Node(
      maxPoints,
      depth,
      new uint256[](0),
      new uint256[](4),
      _initRectangle(0, 0, MAX_INT * 2, MAX_INT * 2),
      false
    );
    nodeID++;
    entities = new Set();
    component = _component;
  }

  function update(uint256 entity, bytes memory value) external virtual correctComponentCaller {
    _update(entity, value);
  }

  // Deletes point from node, if no more points it will leave the empty node
  function remove(uint256 entity) external virtual correctComponentCaller {
    _remove(entity);
  }

  function getEntities() external view returns (uint256[] memory) {
    return entities.getItems();
  }

  function getEntitiesWithValue(bytes memory value) external view returns (uint256[] memory) {
    // Decode boundary
    Rectangle memory boundary = abi.decode(value, (Rectangle));

    // Get entities from points
    Array pointIDs = _query(root, boundary, RefArrayLib.newArray(0));
    uint256 length = pointIDs.length();

    uint256[] memory foundEntities = new uint256[](length);
    for (uint256 i; i < length; i++) {
      foundEntities[i] = points[pointIDs.unsafe_get(i)].entityID;
    }

    return foundEntities;
  }

  function getPoint(uint256 id) external view returns (Point memory) {
    return points[id];
  }

  function getNode(uint256 id) external view returns (Node memory) {
    return nodes[id];
  }

  function printRect(Rectangle memory rect) external view {
    console.log("Rectangle --------");
    console.log("Center X");
    console.logInt(rect.cx);
    console.log("Center Y");
    console.logInt(rect.cy);
    console.log("Width");
    console.log(rect.w);
    console.log("Height");
    console.log(rect.h);
    console.log("West Edge");
    console.logInt(rect.westEdge);
    console.log("East Edge");
    console.logInt(rect.eastEdge);
    console.log("North Edge");
    console.logInt(rect.northEdge);
    console.log("South Edge");
    console.logInt(rect.southEdge);
    console.log("-------------------");
  }

  function supportsInterface(bytes4 interfaceId) external view returns (bool) {
    return interfaceId == type(IERC165).interfaceId || interfaceId == type(IEntityIndexer).interfaceId;
  }

  function printTree(uint256 id) public view {
    Node memory node = nodes[id];
    console.log("Node: ID %s | Depth %s | PCount %s", id, node.depth, node.points.length);
    console.log("Children:");
    console.log("NW: %s", node.children[0]);
    console.log("NE: %s", node.children[1]);
    console.log("SE: %s", node.children[2]);
    console.log("SW: %s", node.children[3]);
    console.log("------------------------");
    if (node.divided) {
      for (uint256 i = 0; i < node.children.length; i++) {
        printTree(node.children[i]);
      }
    }
  }

  function has(uint256 entity) public view returns (bool) {
    return points[entity].entityID > 0;
  }

  function _insert(uint256 id, Point memory point) internal returns (bool) {
    if (!_rectContains(nodes[id].bounds, point)) {
      // The point does not lie inside boundary
      return false;
    }

    if (nodes[id].points.length < nodes[id].maxPoints) {
      // We do not need to divide the current node
      nodes[id].points.push(point.entityID);
      point.parentNode = id;
      points[point.entityID] = point;
      entities.add(point.entityID);
      return true;
    }

    // If there's no room we will divide the node
    if (!nodes[id].divided) {
      _splitNode(id);
    }

    // Insert NE, NW, SE, SW
    return
      _insert(nodes[id].children[0], point) ||
      _insert(nodes[id].children[1], point) ||
      _insert(nodes[id].children[2], point) ||
      _insert(nodes[id].children[3], point);
  }

  function _update(uint256 entity, bytes memory value) internal {
    (int64 x, int64 y) = abi.decode(value, (int64, int64));
    Point memory point = Point(x, y, entity, 0);

    // If entity is in tree remove it first
    if (has(entity)) {
      _remove(entity);
    }

    // Insert the entity/point
    _insert(root, point);
  }

  // Deletes point from node, if no more points it will leave the empty node
  function _remove(uint256 entity) internal {
    require(points[entity].entityID > 0, "Entity is not in Quadtree.");

    uint256 parent = points[entity].parentNode;

    uint256[] memory oldPoints = nodes[parent].points;
    nodes[parent].points = new uint256[](0);
    for (uint256 i; i < oldPoints.length; i++) {
      if (oldPoints[i] != entity) {
        nodes[parent].points.push(oldPoints[i]);
      }
    }
    points[entity].entityID = 0;
    entities.remove(entity);
  }

  function _query(
    uint256 id,
    Rectangle memory boundary,
    Array foundPoints
  ) internal view returns (Array) {
    if (!_rectIntersects(nodes[id].bounds, boundary)) {
      // If the domain of this node does not intersect the search
      // region, we don't need to look in it for points.
      return foundPoints;
    }

    // Search this node's points to see if they lie in the boundary
    for (uint256 i = 0; i < nodes[id].points.length; i++) {
      if (_rectContains(boundary, points[nodes[id].points[i]]) && points[nodes[id].points[i]].entityID > 0) {
        foundPoints.push(nodes[id].points[i]);
      }
    }

    // Search node's children if it was split
    if (nodes[id].divided) {
      for (uint256 i = 0; i < 4; i++) {
        foundPoints = _query(nodes[id].children[i], boundary, foundPoints);
      }
    }

    return foundPoints;
  }

  // casting width and height down is theoretically unsafe but they should never
  // be so large as not to fit into the int64
  function _initRectangle(
    int64 cx,
    int64 cy,
    uint64 w,
    uint64 h
  ) internal pure returns (Rectangle memory rect) {
    rect.cx = cx;
    rect.cy = cy;
    rect.w = w;
    rect.h = h;
    rect.westEdge = cx - int64(w) / 2;
    rect.eastEdge = cx + int64(w) / 2;
    rect.northEdge = cy - int64(h) / 2;
    rect.southEdge = cy + int64(h) / 2;
  }

  function _splitNode(uint256 id) internal {
    int64 cx = nodes[id].bounds.cx;
    int64 cy = nodes[id].bounds.cy;
    uint64 w = nodes[id].bounds.w / 2;
    uint64 h = nodes[id].bounds.h / 2;

    // The boundaries of the four children nodes are "northwest",
    // "northeast", "southeast" and "southwest" quadrants within the
    // boundary of the current node.

    // NW

    nodes[nodeID] = Node(
      nodes[id].maxPoints,
      nodes[id].depth + 1,
      new uint256[](0),
      new uint256[](4),
      _initRectangle(cx - int64(w) / 2, cy - int64(h) / 2, w, h),
      false
    );
    nodes[id].children[0] = nodeID;
    nodeID++;

    // NE
    nodes[nodeID] = Node(
      nodes[id].maxPoints,
      nodes[id].depth + 1,
      new uint256[](0),
      new uint256[](4),
      _initRectangle(cx + int64(w) / 2, cy - int64(h) / 2, w, h),
      false
    );
    nodes[id].children[1] = nodeID;
    nodeID++;

    // SE
    nodes[nodeID] = Node(
      nodes[id].maxPoints,
      nodes[id].depth + 1,
      new uint256[](0),
      new uint256[](4),
      _initRectangle(cx + int64(w) / 2, cy + int64(h) / 2, w, h),
      false
    );
    nodes[id].children[2] = nodeID;
    nodeID++;

    // SW
    nodes[nodeID] = Node(
      nodes[id].maxPoints,
      nodes[id].depth + 1,
      new uint256[](0),
      new uint256[](4),
      _initRectangle(cx - int64(w) / 2, cy + int64(h) / 2, w, h),
      false
    );
    nodes[id].children[3] = nodeID;
    nodeID++;

    nodes[id].divided = true;
  }

  function _rectContains(Rectangle memory rect, Point memory point) internal pure returns (bool) {
    return point.x >= rect.westEdge && point.x < rect.eastEdge && point.y >= rect.northEdge && point.y < rect.southEdge;
  }

  function _rectIntersects(Rectangle memory r1, Rectangle memory r2) internal pure returns (bool) {
    return
      !(r2.westEdge > r1.eastEdge ||
        r2.eastEdge < r1.westEdge ||
        r2.northEdge > r1.southEdge ||
        r2.southEdge < r1.northEdge);
  }
}
