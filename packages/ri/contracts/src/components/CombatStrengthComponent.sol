// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct CombatStrength {
  int32[] combatTypeStrengthBonuses;
}

uint256 constant ID = uint256(keccak256("mudwar.component.CombatStrength"));

contract CombatStrengthComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);

    keys[0] = "combatTypeStrengthBonuses";
    values[0] = LibTypes.SchemaValue.INT32_ARRAY;
  }

  function set(uint256 entity, CombatStrength calldata value) public {
    set(entity, abi.encode(value.combatTypeStrengthBonuses));
  }

  function getValue(uint256 entity) public view returns (CombatStrength memory) {
    int32[] memory combatTypeStrengthBonuses = abi.decode(getRawValue(entity), (int32[]));

    return CombatStrength(combatTypeStrengthBonuses);
  }

  function getEntitiesWithValue(CombatStrength calldata combatWeakness) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(combatWeakness.combatTypeStrengthBonuses));
  }
}
