// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { SystemCall } from "../../../SystemCall.sol";
import { Delegation } from "../../../Delegation.sol";
import { requireInterface } from "../../../requireInterface.sol";
import { NamespaceOwner } from "../../../codegen/tables/NamespaceOwner.sol";
import { UserDelegationControl } from "../../../codegen/tables/UserDelegationControl.sol";
import { IDelegationControl } from "../../../IDelegationControl.sol";

import { Systems } from "../../../codegen/tables/Systems.sol";

function createDelegation(
  address delegator,
  address delegatee,
  ResourceId delegationControlId,
  bytes memory initCallData
) {
  // Store the delegation control contract address
  UserDelegationControl._set({ delegator: delegator, delegatee: delegatee, delegationControlId: delegationControlId });

  // If the delegation is limited...
  if (Delegation.isLimited(delegationControlId)) {
    // Require the delegationControl contract to implement the IDelegationControl interface
    address delegationControl = Systems._getSystem(delegationControlId);
    requireInterface(delegationControl, type(IDelegationControl).interfaceId);

    // Call the delegation control contract's init function
    SystemCall.callWithHooksOrRevert({
      caller: delegator,
      systemId: delegationControlId,
      callData: initCallData,
      value: 0
    });
  }
}
