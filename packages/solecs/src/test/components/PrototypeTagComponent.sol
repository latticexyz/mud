// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { Component } from "../../Component.sol";
import { LibTypes } from "../../LibTypes.sol";

contract PrototypeTagComponent is Component {
  uint256 public constant ID = uint256(keccak256("lib.prototypeTag"));

  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, bool value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (bool) {
    return abi.decode(getRawValue(entity), (bool));
  }

  function getEntitiesWithValue(bool value) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }
}
