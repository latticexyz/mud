// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "../../interfaces/IWorld.sol";
import { Component } from "../../Component.sol";
import { LibTypes } from "../../LibTypes.sol";

uint256 constant TestComponentID = uint256(keccak256("lib.testComponent"));

contract TestComponent is Component {
  constructor(IWorld world) Component(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}

uint256 constant TestComponent1ID = uint256(keccak256("lib.testComponent1"));

contract TestComponent1 is Component {
  constructor(IWorld world) Component(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}

uint256 constant TestComponent2ID = uint256(keccak256("lib.testComponent2"));

contract TestComponent2 is Component {
  constructor(IWorld world) Component(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}

uint256 constant TestComponent3ID = uint256(keccak256("lib.testComponent3"));

contract TestComponent3 is Component {
  constructor(IWorld world) Component(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}

uint256 constant TestComponent4ID = uint256(keccak256("lib.testComponent4"));

contract TestComponent4 is Component {
  constructor(IWorld world) Component(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}
