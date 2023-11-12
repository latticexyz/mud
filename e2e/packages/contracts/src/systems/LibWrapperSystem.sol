// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { Lib2 } from "../Lib2.sol";
import { Lib4 } from "../Lib4.sol";

contract LibWrapperSystem is System {
  function callLib() public returns (string memory) {
    return Lib1.call();
  }

  function callFreeFunc() public returns (string memory) {
    return freeLibWrapper();
  }
}

library Lib1 {
  function call() public pure returns (string memory) {
    return Lib2.call();
  }
}

library Lib3 {
  function call() public pure returns (string memory) {
    return Lib4.call();
  }
}

function freeLibWrapper() pure returns (string memory) {
  return Lib1.call();
}
