// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Stamina {
  uint32 current;
  uint32 max;
  uint32 regeneration;
}

uint256 constant ID = uint256(keccak256("ember.component.staminaComponent"));

contract StaminaComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "current";
    values[0] = LibTypes.SchemaValue.UINT32;

    keys[1] = "max";
    values[1] = LibTypes.SchemaValue.UINT32;

    keys[2] = "regeneration";
    values[2] = LibTypes.SchemaValue.UINT32;
  }

  function set(uint256 entity, Stamina calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Stamina memory) {
    (uint32 current, uint32 max, uint32 regeneration) = abi.decode(getRawValue(entity), (uint32, uint32, uint32));
    return Stamina(current, max, regeneration);
  }

  function getEntitiesWithValue(Stamina calldata stamina) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(stamina));
  }
}
