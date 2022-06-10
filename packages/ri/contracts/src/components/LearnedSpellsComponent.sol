// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

uint256 constant ID = uint256(keccak256("ember.component.learnedSpellsComponent"));

contract LearnedSpellsComponent is Component {
  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values = new LibTypes.SchemaValue[](1);
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;
  }

  function set(uint256 entity, uint256[] calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (uint256[] memory) {
    uint256[] memory learnedSpells = abi.decode(getRawValue(entity), (uint256[]));
    return learnedSpells;
  }

  function getEntitiesWithValue(uint256[] calldata learnedSpells) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(learnedSpells));
  }
}
