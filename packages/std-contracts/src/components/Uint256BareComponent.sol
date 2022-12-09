// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/BareComponent.sol";

/**
 * Reference implementation of a component storing a uint256 value for each entity.
 */
contract Uint256BareComponent is BareComponent {
  constructor(IWorld world) BareComponent(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);

    keys[0] = "value";
    values[0] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, uint256 value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (uint256) {
    uint256 value = abi.decode(getRawValue(entity), (uint256));
    return value;
  }
}
