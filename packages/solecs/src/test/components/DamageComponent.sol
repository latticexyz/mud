// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Component } from "../../Component.sol";
import { LibTypes } from "../../LibTypes.sol";

uint256 constant ID = uint256(keccak256("mudwar.components.Damage"));

contract DamageComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, uint256 value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (uint256) {
    return abi.decode(getRawValue(entity), (uint256));
  }

  function getEntitiesWithValue(uint256 value) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }
}
