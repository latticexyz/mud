// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Lib2 } from "../libraries/Lib2.sol";
import { Lib4 } from "../libraries/Lib4and5.sol";

/**
 * @dev For calling a library using a free function.
 */
function freeLibWrapper() pure returns (string memory) {
  return Lib1.call();
}

/**
 * @title Library 1
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Used for testing that the deployer can handle a single library call
 */
library Lib1 {
  function call() public pure returns (string memory) {
    return Lib2.call();
  }
}

/**
 * @title Library 3
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Testing that the deployer can handle nesting of 3 libraries
 */
library Lib3 {
  function call() public pure returns (string memory) {
    return Lib4.call();
  }
}

/**
 * @title Library Wrapper System
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This contract is used for testing that the deployer can handle deeply nested public libraries
 */
contract LibWrapperSystem is System {
  function callLib() public pure returns (string memory) {
    return Lib1.call();
  }

  function callFreeFunc() public pure returns (string memory) {
    return freeLibWrapper();
  }
}
