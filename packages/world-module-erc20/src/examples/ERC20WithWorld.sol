// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// Adapted example from OpenZeppelin's Contract Wizard: https://wizard.openzeppelin.com/

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WithWorld } from "../StoreConsumer.sol";
import { ERC20Pausable } from "../ERC20Pausable.sol";
import { ERC20Burnable } from "../ERC20Burnable.sol";
import { MUDERC20 } from "../MUDERC20.sol";

contract ERC20WithWorld is WithWorld, MUDERC20, ERC20Pausable, ERC20Burnable {
  constructor(
    IBaseWorld world,
    bytes14 namespace,
    string memory name,
    string memory symbol
  ) WithWorld(world, namespace) MUDERC20(name, symbol) {
    // Transfer namespace ownership to the creator
    world.transferOwnership(getNamespaceId(), _msgSender());
  }

  function mint(address to, uint256 value) public onlyNamespace {
    _mint(to, value);
  }

  function pause() public onlyNamespace {
    _pause();
  }

  function unpause() public onlyNamespace {
    _unpause();
  }

  // The following functions are overrides required by Solidity.

  function _update(address from, address to, uint256 value) internal override(MUDERC20, ERC20Pausable) {
    super._update(from, to, value);
  }
}
