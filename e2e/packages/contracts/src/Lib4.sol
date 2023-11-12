// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

library Lib4 {
  function call() public pure returns (string memory) {
    return Lib5.call();
  }
}

library Lib5 {
  function call() public pure returns (string memory) {
    return "success";
  }
}
