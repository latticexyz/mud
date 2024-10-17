// SPDX-License-Identifier: MIT
// Adapted from OpenZeppelin's ERC20Pausable extension
pragma solidity >=0.8.24;

import { Pausable } from "./Pausable.sol";
import { MUDERC20 } from "./MUDERC20.sol";

abstract contract ERC20Pausable is MUDERC20, Pausable {
  function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
    super._update(from, to, value);
  }
}
