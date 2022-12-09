// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/BareComponent.sol";

contract Uint32BareComponent is BareComponent {
  constructor(IWorld world) BareComponent(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);

    keys[0] = "value";
    values[0] = LibTypes.SchemaValue.UINT32;
  }

  function set(uint256 entity, uint32 value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (uint32) {
    uint32 value = abi.decode(getRawValue(entity), (uint32));
    return value;
  }
}
