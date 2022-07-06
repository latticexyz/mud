// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Stamina {
  int32 current;
  int32 max;
  int32 regeneration;
}

uint256 constant ID = uint256(keccak256("ember.component.staminaComponent"));

contract StaminaComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "current";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "max";
    values[1] = LibTypes.SchemaValue.INT32;

    keys[2] = "regeneration";
    values[2] = LibTypes.SchemaValue.INT32;
  }

  function set(uint256 entity, Stamina calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Stamina memory) {
    (int32 current, int32 max, int32 regeneration) = abi.decode(getRawValue(entity), (int32, int32, int32));
    return Stamina(current, max, regeneration);
  }

  function getEntitiesWithValue(Stamina calldata stamina) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(stamina));
  }
}
