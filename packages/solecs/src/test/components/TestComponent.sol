// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { Component } from "../../Component.sol";

contract TestComponent is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent"));

  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }
}

contract TestComponent1 is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent1"));

  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }
}

contract TestComponent2 is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent2"));

  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }
}

contract TestComponent3 is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent3"));

  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }
}

contract TestComponent4 is Component {
  uint256 public constant ID = uint256(keccak256("lib.testComponent4"));

  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }
}
