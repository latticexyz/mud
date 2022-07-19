// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Factory {
  uint256[] prototypeIds;
  int32[] costs;
  uint32[] costItemTypes;
}

uint256 constant ID = uint256(keccak256("mudwar.component.Factory"));

contract FactoryComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "prototypeIds";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "costs";
    values[1] = LibTypes.SchemaValue.INT32_ARRAY;

    keys[2] = "costItemTypes";
    values[2] = LibTypes.SchemaValue.UINT32_ARRAY;
  }

  function set(uint256 entity, Factory calldata value) public {
    set(entity, encodedValue(value));
  }

  function getValue(uint256 entity) public view returns (Factory memory) {
    (uint256[] memory prototypeIds, int32[] memory costs, uint32[] memory costItemTypes) = abi.decode(
      getRawValue(entity),
      (uint256[], int32[], uint32[])
    );
    return Factory(prototypeIds, costs, costItemTypes);
  }

  function getEntitiesWithValue(Factory calldata factory) public view returns (uint256[] memory) {
    return getEntitiesWithValue(encodedValue(factory));
  }

  function encodedValue(Factory calldata factory) private pure returns (bytes memory) {
    return abi.encode(factory.prototypeIds, factory.costs, factory.costItemTypes);
  }
}
