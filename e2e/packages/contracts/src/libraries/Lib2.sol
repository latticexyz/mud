// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Lib3 } from "../systems/LibWrapperSystem.sol";

/**
 * @title Library 2
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Testing that the deployer can handle nesting of 2 libraries
 * Included in a separate file to test handling libraries in different files
 */
library Lib2 {
  function call() public pure returns (string memory) {
    return Lib3.call();
  }
}
