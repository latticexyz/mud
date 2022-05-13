// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { QuadtreeIndexer, Node, Rectangle, Point } from "../../QuadtreeIndexer.sol";
import { Component } from "../../Component.sol";

contract PublicQuadtreeIndexer is QuadtreeIndexer {
  constructor(
    Component component,
    uint16 maxPoints,
    uint16 depth
  ) QuadtreeIndexer(component, maxPoints, depth) {}

  function initRectangle(
    int64 cx,
    int64 cy,
    uint64 w,
    uint64 h
  ) public pure returns (Rectangle memory rect) {
    return _initRectangle(cx, cy, w, h);
  }

  function insert(uint256 id, Point memory point) external returns (bool) {
    return _insert(id, point);
  }

  function update(uint256 entity, bytes memory value) external override {
    _update(entity, value);
  }

  function remove(uint256 entity) external override {
    _remove(entity);
  }
}
