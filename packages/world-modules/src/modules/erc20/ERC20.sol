// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IERC20 } from "./IERC20.sol";

contract ERC20Proxy is IERC20, SystemHook {
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

  function onBeforeCallSystem(address msgSender, ResourceId systemId, bytes memory callData) public {
    revert SystemHook_NotImplemented();
  }

  function onAfterCallSystem(address msgSender, ResourceId systemId, bytes memory callData) public {
    revert SystemHook_NotImplemented();
  }
}
