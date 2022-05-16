import { World } from "solecs/World.sol";

pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

struct Config {
  bool resetCallerEntityID;
  address personaMirror;
}
struct AppStorage {
  Config config;
  World world;
  uint256 _callerEntityID; // This is short lived and meant to be reset at the end of a function call
  address[] accessControllers;
  mapping(bytes4 => address) embodiedSystemSelectorToImplementation;
}

library LibAppStorage {
  function diamondStorage() internal pure returns (AppStorage storage ds) {
    assembly {
      ds.slot := 0
    }
  }
}
