// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "../interfaces/IWorld.sol";
import { BareComponent } from "../BareComponent.sol";
import { LibTypes } from "../LibTypes.sol";

struct ApprovalEntityReversal {
  address grantor;
  address grantee;
  uint256 systemId;
}

/// @title Reverse mapping of approvalEntity to its hashed values.
/// @dev It's important to know which approvals belong to which grantors, so they can be revoked.
contract ApprovalEntityReversalComponent is BareComponent {
  constructor(address world, uint256 id) BareComponent(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "grantor";
    values[0] = LibTypes.SchemaValue.ADDRESS;

    keys[1] = "grantee";
    values[1] = LibTypes.SchemaValue.ADDRESS;

    keys[2] = "systemId";
    values[2] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, ApprovalEntityReversal memory value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (ApprovalEntityReversal memory) {
    return abi.decode(getRawValue(entity), (ApprovalEntityReversal));
  }
}
