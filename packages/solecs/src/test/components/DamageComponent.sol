// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "../../Component.sol";

uint256 constant ID = uint256(keccak256("ember.components.DamageComponent"));

contract DamageComponent is Component {
  constructor(address world) Component(world) {}

  function set(uint256 entity, uint256 value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (uint256) {
    return abi.decode(getRawValue(entity), (uint256));
  }

  function getEntitiesWithValue(uint256 value) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }

  function getID() public pure override returns (uint256) {
    return ID;
  }
}
