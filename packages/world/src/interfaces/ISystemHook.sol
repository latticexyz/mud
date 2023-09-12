// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ERC165 } from "./ERC165.sol";

// ERC-165 Interface ID (see https://eips.ethereum.org/EIPS/eip-165)
bytes4 constant SYSTEM_HOOK_INTERFACE_ID = ISystemHook.onBeforeCallSystem.selector ^
  ISystemHook.onAfterCallSystem.selector;

interface ISystemHook is ERC165 {
  function onBeforeCallSystem(address msgSender, bytes32 resourceSelector, bytes memory funcSelectorAndArgs) external;

  function onAfterCallSystem(address msgSender, bytes32 resourceSelector, bytes memory funcSelectorAndArgs) external;
}
