// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct BlueprintComponents {
  uint256[] componentIds;
}

uint256 constant ID = uint256(keccak256("ember.component.blueprintComponentsComponent"));

contract BlueprintComponentsComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);

    keys[0] = "componentIds";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;
  }

  function set(uint256 entity, BlueprintComponents calldata value) public {
    set(entity, abi.encode(value.componentIds));
  }

  function getValue(uint256 entity) public view returns (BlueprintComponents memory) {
    bytes memory _b = getRawValue(entity);
    uint256[] memory componentIds = abi.decode(_b, (uint256[]));
    return BlueprintComponents(componentIds);
  }

  function getEntitiesWithValue(BlueprintComponents calldata blueprintComponents)
    public
    view
    returns (uint256[] memory)
  {
    return getEntitiesWithValue(abi.encode(blueprintComponents.componentIds));
  }
}
