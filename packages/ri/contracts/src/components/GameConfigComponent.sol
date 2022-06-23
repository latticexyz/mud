// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct GameConfig {
  // Block timestamp when the game started
  uint256 startTime;
  // Number of seconds
  uint256 turnLength;
}

uint256 constant GodID = uint256(keccak256("ember.god"));
uint256 constant ID = uint256(keccak256("ember.component.gameConfigComponent"));

contract GameConfigComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "startTime";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "turnLength";
    values[1] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, GameConfig calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (GameConfig memory) {
    (uint256 startTime, uint256 turnLength) = abi.decode(getRawValue(entity), (uint256, uint256));
    return GameConfig(startTime, turnLength);
  }

  function getEntitiesWithValue(GameConfig calldata coord) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(coord));
  }
}
