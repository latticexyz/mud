// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "../../interfaces/IWorld.sol";
import { Component } from "../../Component.sol";
import { LibTypes } from "../../LibTypes.sol";

struct Position {
  int64 x;
  int64 y;
}

uint256 constant ID = uint256(keccak256("mudwar.components.Position"));

contract PositionComponent is Component {
  constructor(IWorld world) Component(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys[0] = "x";
    values[0] = LibTypes.SchemaValue.INT64;

    keys[1] = "y";
    values[1] = LibTypes.SchemaValue.INT64;
  }

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
}
