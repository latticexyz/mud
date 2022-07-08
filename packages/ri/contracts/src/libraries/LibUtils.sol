// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { World, WorldQueryFragment } from "solecs/World.sol";
import { QueryFragment, QueryType, LibQuery } from "solecs/LibQuery.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";

library LibUtils {
  function toHex(bytes memory data) internal pure returns (bytes memory res) {
    res = new bytes(data.length * 2);
    bytes memory alphabet = "0123456789abcdef";
    for (uint256 i = 0; i < data.length; i++) {
      res[i * 2 + 0] = alphabet[uint256(uint8(data[i])) >> 4];
      res[i * 2 + 1] = alphabet[uint256(uint8(data[i])) & 15];
    }
  }

  function arrayContains(uint256[] memory arr, uint256 value) internal pure returns (bool) {
    for (uint256 i; i < arr.length; i++) {
      if (arr[i] == value) {
        return true;
      }
    }
    return false;
  }

  function safeDelegateCall(address addr, bytes memory callData) internal returns (bytes memory) {
    (bool success, bytes memory returnData) = addr.delegatecall(callData);
    // if the function call reverted
    if (success == false) {
      // if there is a return reason string
      if (returnData.length > 0) {
        // bubble up any reason for revert
        assembly {
          let returnDataSize := mload(returnData)
          revert(add(32, returnData), returnDataSize)
        }
      } else {
        revert("DelegateCall reverted");
      }
    }
    return returnData;
  }

  function manhattan(Coord memory a, Coord memory b) internal pure returns (int32) {
    int32 dx = a.x > b.x ? a.x - b.x : b.x - a.x;
    int32 dy = a.y > b.y ? a.y - b.y : b.y - a.y;
    return dx + dy;
  }

  // Using componentComponent
  function getEntityAt(IUint256Component components, Coord memory position)
    internal
    view
    returns (uint256, bool found)
  {
    QueryFragment[] memory fragments = new QueryFragment[](1);
    fragments[0] = QueryFragment(
      QueryType.HasValue,
      IComponent(getAddressById(components, PositionComponentID)),
      abi.encode(position)
    );
    uint256[] memory entities = LibQuery.query(fragments);
    if (entities.length == 0) return (0, false);
    return (entities[0], true);
  }

  // Using world
  function getEntityAt(World world, Coord memory position) internal view returns (uint256, bool found) {
    WorldQueryFragment[] memory fragments = new WorldQueryFragment[](1);
    fragments[0] = WorldQueryFragment(QueryType.HasValue, PositionComponentID, abi.encode(position));
    uint256[] memory entities = world.query(fragments);
    if (entities.length == 0) return (0, false);
    return (entities[0], true);
  }

  // Using componentComponent
  function getEntityWithAt(
    IUint256Component components,
    uint256 componentID,
    Coord memory position
  ) internal view returns (uint256 entity, bool found) {
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(
      QueryType.HasValue,
      IComponent(getAddressById(components, PositionComponentID)),
      abi.encode(position)
    );
    fragments[1] = QueryFragment(QueryType.Has, IComponent(getAddressById(components, componentID)), new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);
    if (entities.length == 0) return (0, false);
    return (entities[0], true);
  }

  // Using world
  function getEntityWithAt(
    World world,
    uint256 componentID,
    Coord memory position
  ) internal view returns (uint256 entity, bool found) {
    WorldQueryFragment[] memory fragments = new WorldQueryFragment[](2);
    fragments[0] = WorldQueryFragment(QueryType.HasValue, PositionComponentID, abi.encode(position));
    fragments[1] = WorldQueryFragment(QueryType.Has, componentID, new bytes(0));
    uint256[] memory entities = world.query(fragments);
    if (entities.length == 0) return (0, false);
    return (entities[0], true);
  }
}
