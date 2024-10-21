// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// Adapted example from OpenZeppelin's Contract Wizard: https://wizard.openzeppelin.com/

import { WithStore } from "../StoreConsumer.sol";
import { Ownable } from "../Ownable.sol";
import { ERC20Pausable } from "../ERC20Pausable.sol";
import { ERC20Burnable } from "../ERC20Burnable.sol";
import { MUDERC20 } from "../MUDERC20.sol";

contract ERC20WithInternalStore is WithStore(address(this)), MUDERC20, ERC20Pausable, ERC20Burnable, Ownable {
  constructor() MUDERC20("MyERC20", "MTK") Ownable(_msgSender()) {}

  function mint(address to, uint256 value) public onlyOwner {
    _mint(to, value);
  }

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  // The following functions are overrides required by Solidity.

  function _update(address from, address to, uint256 value) internal override(MUDERC20, ERC20Pausable) {
    super._update(from, to, value);
  }
}
