// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ISystemHook {
  function onBeforeCallSystem(address msgSender, bytes32 resourceSelector, bytes memory funcSelectorAndArgs) external;

  function onAfterCallSystem(address msgSender, bytes32 resourceSelector, bytes memory funcSelectorAndArgs) external;
}
