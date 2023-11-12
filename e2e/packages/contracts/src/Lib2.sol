// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Lib3 } from "./systems/LibWrapperSystem.sol";

library Lib2 {
  function call() public pure returns (string memory) {
    return Lib3.call();
  }
}
