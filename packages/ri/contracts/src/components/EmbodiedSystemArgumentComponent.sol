// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

uint256 constant ID = uint256(keccak256("ember.component.embodiedSystemArgumentComponent"));

contract EmbodiedSystemArgumentComponent is Component {
  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }

  function getValue(uint256 entity) public view returns (bytes memory) {
    return getRawValue(entity);
  }
}
