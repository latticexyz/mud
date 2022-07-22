// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IWorld } from "./interfaces/IWorld.sol";
import { IComponent } from "./interfaces/IComponent.sol";

import { Set } from "./Set.sol";
import { MapSet } from "./MapSet.sol";
import { LibTypes } from "./LibTypes.sol";

abstract contract SimpleComponent is IComponent {
  uint256[] private entities;
  mapping(uint256 => bool) private hasEntity;
  mapping(uint256 => uint256[]) private valueToEntities;
  mapping(uint256 => bytes) private entityToValue;

  function set(uint256 entity, bytes memory value) public {
    // log something
  }

  function remove(uint256 entity) public {
    // log something
  }

  function has(uint256 entity) public view returns (bool) {
    // read a hasEntity storage slot
    // storage slot will be dynamically populated based on the current cache (we'll compute all the valid storage slots)
  }

  function getRawValue(uint256 entity) public view returns (bytes memory) {
    // read a valueToEntities storage slot
    // will be populated automagically from the cache (we'll compute all the valid storage slots)
  }

  function getEntities() public view returns (uint256[] memory) {
    // this first array stroage slot will be populated automagically depending on entities that are in the component
    return entities;
  }

  function getEntitiesWithValue(bytes memory value) public view returns (uint256[] memory) {
    // read a valueToEntities storage slot (we'll compute the first array storage slot) depending on the hash of all possible
  }
}
