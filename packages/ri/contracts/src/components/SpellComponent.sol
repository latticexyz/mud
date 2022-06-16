// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

enum SpellTargetFilter {
  SELF,
  TILE
}

struct Spell {
  bytes4 embodiedSystemSelector;
  SpellTargetFilter spellTargetFilter;
}

uint256 constant ID = uint256(keccak256("ember.component.spellComponent"));

contract SpellComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    values = new LibTypes.SchemaValue[](1);
    values[0] = LibTypes.SchemaValue.UINT8;
  }

  function set(uint256 entity, Spell calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Spell memory) {
    (bytes4 embodiedSystemSelector, uint256 spellTargetFilter) = abi.decode(getRawValue(entity), (bytes4, uint256));
    return Spell(embodiedSystemSelector, SpellTargetFilter(spellTargetFilter));
  }

  function getEntitiesWithValue(Spell calldata spell) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(spell));
  }
}
