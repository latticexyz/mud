// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { World, WorldQueryFragment } from "solecs/World.sol";
import { QueryFragment, QueryType } from "solecs/LibQuery.sol";
import { ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";

function manhattan(Coord memory a, Coord memory b) pure returns (int32) {
  int32 dx = a.x > b.x ? a.x - b.x : b.x - a.x;
  int32 dy = a.y > b.y ? a.y - b.y : b.y - a.y;
  return dx + dy;
}

function getEntityAt(World world, Coord memory position) view returns (uint256, bool found) {
  WorldQueryFragment[] memory fragments = new WorldQueryFragment[](1);
  fragments[0] = WorldQueryFragment(QueryType.HasValue, PositionComponentID, abi.encode(position));
  uint256[] memory entities = world.query(fragments);
  if (entities.length == 0) return (0, false);
  return (entities[0], true);
}

function getEntityWithAt(
  World world,
  uint256 componentID,
  Coord memory position
) view returns (uint256 entity, bool found) {
  WorldQueryFragment[] memory fragments = new WorldQueryFragment[](2);
  fragments[0] = WorldQueryFragment(QueryType.HasValue, PositionComponentID, abi.encode(position));
  fragments[1] = WorldQueryFragment(QueryType.Has, componentID, new bytes(0));
  uint256[] memory entities = world.query(fragments);
  if (entities.length == 0) return (0, false);
  return (entities[0], true);
}
