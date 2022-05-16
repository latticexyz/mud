// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct MaxDistance {
  uint256 maxDistance;
}

uint256 constant ID = uint256(keccak256("ember.component.maxDistanceComponent"));

contract MaxDistanceComponent is Component {
  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }

  function set(uint256 entity, MaxDistance calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (MaxDistance memory) {
    uint256 maxDistance = abi.decode(getRawValue(entity), (uint256));
    return MaxDistance(maxDistance);
  }

  function getEntitiesWithValue(MaxDistance calldata maxDistance) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(maxDistance));
  }
}
