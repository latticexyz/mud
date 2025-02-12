// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// Adapted example from OpenZeppelin's Contract Wizard: https://wizard.openzeppelin.com/

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldConsumer } from "@latticexyz/world-consumer/src/experimental/WorldConsumer.sol";

import { Pausable } from "../experimental/Pausable.sol";
import { ERC20Pausable } from "../experimental/ERC20Pausable.sol";
import { ERC20Burnable } from "../experimental/ERC20Burnable.sol";
import { MUDERC20 } from "../experimental/MUDERC20.sol";

contract ERC20PausableBurnable is MUDERC20, ERC20Pausable, ERC20Burnable {
  bytes14 immutable namespace;

  constructor(
    IBaseWorld world,
    bytes14 _namespace
  ) WorldConsumer(world) MUDERC20(_namespace) ERC20Pausable(_namespace) {
    namespace = _namespace;
  }

  function initialize(string memory name, string memory symbol) external {
    MUDERC20._init(name, symbol);
    Pausable._init();
  }

  function mint(address to, uint256 value) public onlyNamespace(namespace) {
    _mint(to, value);
  }

  function pause() public onlyNamespace(namespace) {
    _pause();
  }

  function unpause() public onlyNamespace(namespace) {
    _unpause();
  }

  // The following functions are overrides required by Solidity.

  function _update(address from, address to, uint256 value) internal override(MUDERC20, ERC20Pausable) {
    super._update(from, to, value);
  }
}
