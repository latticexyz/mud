// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "../../interfaces/IWorld.sol";
import { Component } from "../../Component.sol";
import { LibTypes } from "../../LibTypes.sol";

uint256 constant ID = uint256(keccak256("lib.fromPrototype"));

contract FromPrototypeComponent is Component {
  constructor(IWorld world) Component(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, uint256 prototypeEntity) public {
    set(entity, abi.encode(prototypeEntity));
  }

  function getValue(uint256 entity) public view returns (uint256) {
    return abi.decode(getRawValue(entity), (uint256));
  }

  function getEntitiesWithValue(uint256 prototypeEntity) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(prototypeEntity));
  }
}
