// SPDX-License-Identifier: MIT
// Adapted from OpenZeppelin's ERC20Burnable extension
pragma solidity >=0.8.24;

import { MUDERC20 } from "./MUDERC20.sol";

abstract contract ERC20Burnable is MUDERC20 {
  function burn(uint256 value) public virtual {
    _burn(_msgSender(), value);
  }

  function burnFrom(address account, uint256 value) public virtual {
    _spendAllowance(account, _msgSender(), value);
    _burn(account, value);
  }
}
