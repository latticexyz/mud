// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Combat {
  uint32 _type;
  int32 strength;
  int32 health;
  bool passive;
}

uint256 constant ID = uint256(keccak256("mudwar.component.Combat"));

contract CombatComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](4);
    values = new LibTypes.SchemaValue[](4);

    keys[0] = "_type";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "strength";
    values[1] = LibTypes.SchemaValue.INT32;

    keys[2] = "health";
    values[2] = LibTypes.SchemaValue.INT32;

    keys[3] = "passive";
    values[3] = LibTypes.SchemaValue.INT32;
  }

  function set(uint256 entity, Combat calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Combat memory) {
    (uint32 _type, int32 strength, int32 health, bool passive) = abi.decode(
      getRawValue(entity),
      (uint32, int32, int32, bool)
    );
    return Combat(_type, strength, health, passive);
  }

  function getEntitiesWithValue(Combat calldata combat) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(combat));
  }
}
