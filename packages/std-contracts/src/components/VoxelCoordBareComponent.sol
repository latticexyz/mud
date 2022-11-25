// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/BareComponent.sol";

struct VoxelCoord {
  int32 x;
  int32 y;
  int32 z;
}

contract VoxelCoordComponent is BareComponent {
  constructor(address world, uint256 id) BareComponent(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "x";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "y";
    values[1] = LibTypes.SchemaValue.INT32;

    keys[2] = "z";
    values[2] = LibTypes.SchemaValue.INT32;
  }

  function set(uint256 entity, VoxelCoord calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (VoxelCoord memory) {
    (int32 x, int32 y, int32 z) = abi.decode(getRawValue(entity), (int32, int32, int32));
    return VoxelCoord(x, y, z);
  }
}
