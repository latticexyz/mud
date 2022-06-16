// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { Component } from "../../Component.sol";
import { LibTypes } from "../../LibTypes.sol";

contract TestComponent is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent"));

  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}

contract TestComponent1 is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent1"));

  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}

contract TestComponent2 is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent2"));

  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}

contract TestComponent3 is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent3"));

  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}

contract TestComponent4 is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent4"));

  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values[0] = LibTypes.SchemaValue.UINT256;
  }
}
