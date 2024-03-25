// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Hook, HookLib } from "@latticexyz/store/src/Hook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { System } from "../../../System.sol";
import { WorldContextConsumer, IWorldContextConsumer } from "../../../WorldContext.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "../../../WorldResourceId.sol";
import { SystemCall } from "../../../SystemCall.sol";
import { ROOT_NAMESPACE_ID, ROOT_NAME } from "../../../constants.sol";
import { RESOURCE_NAMESPACE, RESOURCE_SYSTEM } from "../../../worldResourceTypes.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { Delegation } from "../../../Delegation.sol";
import { requireInterface } from "../../../requireInterface.sol";
import { NamespaceOwner } from "../../../codegen/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../../codegen/tables/ResourceAccess.sol";
import { UserDelegationControl } from "../../../codegen/tables/UserDelegationControl.sol";
import { UserDelegationNonces } from "../../../codegen/tables/UserDelegationNonces.sol";
import { NamespaceDelegationControl } from "../../../codegen/tables/NamespaceDelegationControl.sol";
import { ISystemHook } from "../../../ISystemHook.sol";
import { IWorldErrors } from "../../../IWorldErrors.sol";
import { IDelegationControl } from "../../../IDelegationControl.sol";

import { SystemHooks } from "../../../codegen/tables/SystemHooks.sol";
import { SystemRegistry } from "../../../codegen/tables/SystemRegistry.sol";
import { Systems } from "../../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../../codegen/tables/FunctionSelectors.sol";
import { FunctionSignatures } from "../../../codegen/tables/FunctionSignatures.sol";
import { requireNamespace } from "../../../requireNamespace.sol";
import { requireValidNamespace } from "../../../requireValidNamespace.sol";

import { LimitedCallContext } from "../LimitedCallContext.sol";
import { getSignedMessageHash } from "./getSignedMessageHash.sol";
import { ECDSA } from "./ECDSA.sol";
import { createDelegation } from "./createDelegation.sol";

/**
 * @title WorldRegistrationSystem
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This contract provides functions related to registering resources other than tables in the World.
 */
contract DelegationSystem is System, IWorldErrors, LimitedCallContext {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @notice Registers a delegation for `delegator` with a signature
   * @dev Creates a new delegation from the caller to the specified delegatee
   * @param delegatee The address of the delegatee
   * @param delegationControlId The ID controlling the delegation
   * @param initCallData The initialization data for the delegation
   * @param delegator The address of the delegator
   * @param signature The EIP712 signature
   */
  function registerDelegationWithSignature(
    address delegatee,
    ResourceId delegationControlId,
    bytes memory initCallData,
    address delegator,
    bytes calldata signature
  ) public onlyDelegatecall {
    uint256 nonce = UserDelegationNonces.get(delegator);
    bytes32 hash = getSignedMessageHash(delegatee, delegationControlId, initCallData, nonce, _world());

    // If the message was not signed by the delegator or is invalid, revert
    (address signer, , ) = ECDSA.tryRecover(hash, signature);
    if (signer != delegator) {
      revert World_InvalidSigner(delegator, delegatee);
    }

    UserDelegationNonces.set(delegator, nonce + 1);

    createDelegation(delegator, delegatee, delegationControlId, initCallData);
  }
}
