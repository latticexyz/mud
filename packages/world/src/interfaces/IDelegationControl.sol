// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IDelegationControl {
  function verify(address delegator, bytes32 systemId, bytes calldata funcSelectorAndArgs) external returns (bool);
}
