// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Position {
  uint256 x;
  uint256 y;
}

uint256 constant ID = uint256(keccak256("ember.component.positionComponent"));

contract PositionComponent is Component {
  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }

  function set(uint256 entity, Position calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Position memory) {
    (uint256 x, uint256 y) = abi.decode(getRawValue(entity), (uint256, uint256));
    return Position(x, y);
  }

  function getEntitiesWithValue(Position calldata position) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(position));
  }
}
