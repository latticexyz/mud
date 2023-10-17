// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { IERC20 } from "./IERC20.sol";

contract ERC20System is IERC20 {
  function totalSupply() external view returns (uint256) {
    revert("not implemented");
  }

  function balanceOf(address who) external view returns (uint256) {
    revert("not implemented");
  }

  function allowance(address owner, address spender) external view returns (uint256) {
    revert("not implemented");
  }

  function transfer(address to, uint256 value) external returns (bool) {
    revert("not implemented");
  }

  function approve(address spender, uint256 value) external returns (bool) {
    revert("not implemented");
  }

  function transferFrom(address from, address to, uint256 value) external returns (bool) {
    revert("not implemented");
  }
}
