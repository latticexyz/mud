// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

interface IAllowance {
  function getAllowance(address spender) external returns (uint256 allowance);
}
