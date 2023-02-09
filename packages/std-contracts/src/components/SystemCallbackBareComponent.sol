// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// imports for the component
import { LibTypes } from "solecs/LibTypes.sol";
import { BareComponent } from "solecs/BareComponent.sol";

// imports for `executeSystemCallback` helper
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { getAddressById } from "solecs/utils.sol";

struct SystemCallback {
  uint256 systemId;
  bytes args;
}

contract SystemCallbackBareComponent is BareComponent {
  constructor(address world, uint256 id) BareComponent(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "systemId";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "args";
    values[1] = LibTypes.SchemaValue.BYTES;
  }

  function set(uint256 entity, SystemCallback memory value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (SystemCallback memory) {
    bytes memory rawValue = getRawValue(entity);

    if (rawValue.length > 0) {
      return abi.decode(rawValue, (SystemCallback));
    }
  }
}

/**
 * @dev Queries `world.systems()` for `cb.systemId`,
 * then executes the system with `cb.args`.
 */
function executeSystemCallback(IWorld world, SystemCallback memory cb) returns (bytes memory) {
  ISystem system = ISystem(getAddressById(world.systems(), cb.systemId));
  return system.execute(cb.args);
}
