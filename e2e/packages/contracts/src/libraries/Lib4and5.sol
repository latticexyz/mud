// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title Library 4
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Testing that the deployer can handle nesting of 4 libraries
 * Included in a separate file to test handling libraries in different files
 */
library Lib4 {
  function call() public pure returns (string memory) {
    return Lib5.call();
  }
}

/**
 * @title Library 5
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Testing that the deployer can handle nesting of 4 libraries
 * Included in a separate file to test handling libraries in different files
 */
library Lib5 {
  function call() public pure returns (string memory) {
    return "success";
  }
}
