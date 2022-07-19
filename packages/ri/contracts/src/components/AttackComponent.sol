// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Attack {
  int32 strength;
  int32 range;
}

uint256 constant ID = uint256(keccak256("mudwar.component.Attack"));

contract AttackComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "strength";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "range";
    values[1] = LibTypes.SchemaValue.INT32;
  }

  function set(uint256 entity, Attack calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Attack memory) {
    (int32 strength, int32 range) = abi.decode(getRawValue(entity), (int32, int32));
    return Attack(strength, range);
  }

  function getEntitiesWithValue(Attack calldata attack) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(attack));
  }
}
