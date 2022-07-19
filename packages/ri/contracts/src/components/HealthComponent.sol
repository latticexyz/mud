// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Health {
  int32 current;
  int32 max;
}

uint256 constant ID = uint256(keccak256("mudwar.component.Health"));

contract HealthComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "current";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "max";
    values[1] = LibTypes.SchemaValue.INT32;
  }

  function set(uint256 entity, Health calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Health memory) {
    (int32 current, int32 max) = abi.decode(getRawValue(entity), (int32, int32));
    return Health(current, max);
  }

  function getEntitiesWithValue(Health calldata health) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(health));
  }
}
