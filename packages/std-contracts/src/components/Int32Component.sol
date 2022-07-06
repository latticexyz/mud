// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

contract Int32Component is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);

    keys[0] = "value";
    values[0] = LibTypes.SchemaValue.INT32;
  }

  function set(uint256 entity, int32 value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (int32) {
    int32 value = abi.decode(getRawValue(entity), (int32));
    return value;
  }

  function getEntitiesWithValue(int32 value) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }
}
