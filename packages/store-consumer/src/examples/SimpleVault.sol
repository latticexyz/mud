// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WithWorld } from "../experimental/WithWorld.sol";

interface IERC20 {
  function transfer(address to, uint256 value) external returns (bool);
  function allowance(address owner, address spender) external view returns (uint256);
  function approve(address spender, uint256 value) external returns (bool);
  function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * @title SimpleVault (NOT AUDITED)
 * @dev Simple example of a Vault that allows accounts with namespace access to transfer its tokens out
 * IMPORTANT: this contract expects an existing namespace
 * TODO: we should probably allow users of WithWorld to determine if they need to register the namespace or not
 */
contract SimpleVault is WithWorld {
  constructor(IBaseWorld world, bytes14 namespace) WithWorld(world, namespace) {}

  // Only accounts with namespace access (e.g. namespace systems) can transfer the ERC20 tokens held by this contract
  function transferTo(IERC20 token, address to, uint256 amount) external onlyNamespace {
    require(token.transfer(to, amount), "Transfer failed");
  }

  // ... other methods to deposit, etc
}
