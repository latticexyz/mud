// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

contract BoolComponent is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);

    keys[0] = "value";
    values[0] = LibTypes.SchemaValue.BOOL;
  }

  function set(uint256 entity) public {
    set(entity, abi.encode(true));
  }

  function getValue(uint256 entity) public view virtual returns (bool) {
    bool value = abi.decode(getRawValue(entity), (bool));
    return value;
  }

  function getEntitiesWithValue(bool value) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }
}
