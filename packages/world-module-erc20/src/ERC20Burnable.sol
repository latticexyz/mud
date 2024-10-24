// SPDX-License-Identifier: MIT
// Adapted from OpenZeppelin's [ERC20Burnable extension](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f989fff93168606c726bc5e831ef50dd6e543f45/contracts/token/ERC20/extensions/ERC20Burnable.sol)
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
