// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBatchCallSystem {
  function batchCall_system_batchCall(bytes32[] memory resourceSelectors, bytes[] memory funcSelectorAndArgs) external;
}
