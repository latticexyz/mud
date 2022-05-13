// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import '../../Component.sol';
import { Point } from '../../QuadtreeIndexer.sol';

struct Position {
  int64 x;
  int64 y;
}

uint256 constant ID = uint256(keccak256('ember.components.PositionComponent'));

contract PositionComponent is Component {
  constructor(address world) Component(world) {}

  function set(uint256 entity, Position calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Position memory) {
    (int64 x, int64 y) = abi.decode(getRawValue(entity), (int64, int64));
    return Position(x, y);
  }

  function getEntitiesWithValue(Position calldata value) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }

  function getID() public pure override returns (uint256) {
    return ID;
  }
}
