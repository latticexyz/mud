// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAccessController {
  function getEntityCallerIDFromAddress(address caller, bytes4 sig) external view returns (uint256);
}
