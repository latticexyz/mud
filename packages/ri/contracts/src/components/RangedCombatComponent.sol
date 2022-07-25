// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct RangedCombat {
  int32 strength;
  int32 minRange;
  int32 maxRange;
}

uint256 constant ID = uint256(keccak256("mudwar.component.RangedCombat"));

contract RangedCombatComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "strength";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "minRange";
    values[1] = LibTypes.SchemaValue.INT32;

    keys[2] = "maxRange";
    values[2] = LibTypes.SchemaValue.INT32;
  }

  function set(uint256 entity, RangedCombat calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (RangedCombat memory) {
    (int32 strength, int32 minRange, int32 maxRange) = abi.decode(getRawValue(entity), (int32, int32, int32));
    return RangedCombat(strength, minRange, maxRange);
  }

  function getEntitiesWithValue(RangedCombat calldata combat) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(combat));
  }
}
