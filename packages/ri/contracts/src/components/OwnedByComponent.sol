// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct OwnedBy {
  uint256 ownedBy;
}

uint256 constant ID = uint256(keccak256("ember.component.ownedBy"));

contract OwnedByComponent is Component {
  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);
    keys[0] = "ownedBy";
    values[0] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, OwnedBy calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (OwnedBy memory) {
    uint256 ownedBy = abi.decode(getRawValue(entity), (uint256));
    return OwnedBy(ownedBy);
  }

  function getEntitiesWithValue(OwnedBy calldata ownedBy) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(ownedBy));
  }
}
