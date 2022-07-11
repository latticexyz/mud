// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Factory {
  uint256[] prototypeIds;
  int32[] costs;
}

uint256 constant ID = uint256(keccak256("ember.component.factoryComponent"));

contract FactoryComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "prototypeIds";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "costs";
    values[1] = LibTypes.SchemaValue.INT32_ARRAY;
  }

  function set(uint256 entity, Factory calldata value) public {
    set(entity, encodedValue(value));
  }

  function getValue(uint256 entity) public view returns (Factory memory) {
    (uint256[] memory prototypeIds, int32[] memory costs) = abi.decode(getRawValue(entity), (uint256[], int32[]));
    return Factory(prototypeIds, costs);
  }

  function getEntitiesWithValue(Factory calldata factory) public view returns (uint256[] memory) {
    return getEntitiesWithValue(encodedValue(factory));
  }

  function encodedValue(Factory calldata factory) private pure returns (bytes memory) {
    return abi.encode(factory.prototypeIds, factory.costs);
  }
}
