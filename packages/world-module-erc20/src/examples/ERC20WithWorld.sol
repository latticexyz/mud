// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// Adapted example from OpenZeppelin's Contract Wizard: https://wizard.openzeppelin.com/

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WithWorld } from "@latticexyz/store-consumer/src/experimental/WithWorld.sol";
import { Context } from "@latticexyz/store-consumer/src/experimental/Context.sol";

import { ERC20Pausable } from "../experimental/ERC20Pausable.sol";
import { ERC20Burnable } from "../experimental/ERC20Burnable.sol";
import { MUDERC20 } from "../experimental/MUDERC20.sol";

contract ERC20WithWorld is WithWorld, MUDERC20, ERC20Pausable, ERC20Burnable {
  constructor(
    IBaseWorld world,
    bytes14 namespace,
    string memory name,
    string memory symbol
  ) WithWorld(world, namespace, true) MUDERC20(name, symbol) {
    // Transfer namespace ownership to the creator
    world.transferOwnership(getNamespaceId(), _msgSender());
  }

  function mint(address to, uint256 value) public onlyWorld {
    _mint(to, value);
  }

  function pause() public onlyWorld {
    _pause();
  }

  function unpause() public onlyWorld {
    _unpause();
  }

  // The following functions are overrides required by Solidity.

  function _msgSender() public view override(Context, WithWorld) returns (address sender) {
    return super._msgSender();
  }

  function _update(address from, address to, uint256 value) internal override(MUDERC20, ERC20Pausable) {
    super._update(from, to, value);
  }
}
