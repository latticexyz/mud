// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "../interfaces/IWorld.sol";
import { Approval } from "../interfaces/IApprovalSystem.sol";
import { BareComponent } from "../BareComponent.sol";
import { LibTypes } from "../LibTypes.sol";

contract ApprovalComponent is BareComponent {
  constructor(address world, uint256 id) BareComponent(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "expiryTimestamp";
    values[0] = LibTypes.SchemaValue.UINT128;

    keys[1] = "numCalls";
    values[1] = LibTypes.SchemaValue.UINT128;

    keys[2] = "args";
    values[2] = LibTypes.SchemaValue.BYTES;
  }

  function set(uint256 entity, Approval memory value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (Approval memory value) {
    // ensure getValue always succeeds; the caller is then responsible for checking empty values
    bytes memory rawValue = getRawValue(entity);
    if (rawValue.length == 0) {
      return value;
    }
    value = abi.decode(rawValue, (Approval));
    return value;
  }
}
