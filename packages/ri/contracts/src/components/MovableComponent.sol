// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "std-contracts/components/Int32Component.sol";

uint256 constant ID = uint256(keccak256("mudwar.component.Movable"));

contract MovableComponent is Int32Component {
  constructor(address world) Int32Component(world, ID) {}
}
