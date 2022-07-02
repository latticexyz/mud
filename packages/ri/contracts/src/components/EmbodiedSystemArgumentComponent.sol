// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

uint256 constant ID = uint256(keccak256("ember.component.embodiedSystemArgumentComponent"));

contract EmbodiedSystemArgumentComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values = new LibTypes.SchemaValue[](1);
    values[0] = LibTypes.SchemaValue.BYTES;
  }

  function getValue(uint256 entity) public view returns (bytes memory) {
    return getRawValue(entity);
  }
}
