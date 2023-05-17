// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ISystemHook {
  function onBeforeCallSystem(address msgSender, address systemAddress, bytes memory funcSelectorAndArgs) external;

  function onAfterCallSystem(address msgSender, address systemAddress, bytes memory funcSelectorAndArgs) external;
}
