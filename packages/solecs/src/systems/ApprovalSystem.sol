// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "../interfaces/IWorld.sol";
import { IApprovalSystem } from "../interfaces/IApprovalSystem.sol";
import { ApprovalComponent, Approval } from "../components/ApprovalComponent.sol";
import { ApprovalEntityReversalComponent, ApprovalEntityReversal } from "../components/ApprovalEntityReversalComponent.sol";
import { getAddressById, getIdByAddress } from "../utils.sol";
import { approvalComponentId, approvalEntityReversalComponentId } from "../constants.sol";
import { System } from "../System.sol";

/// @dev Approval entity = hashed(grantor, grantee, systemId)
/// @param systemId For generic approval use 0
function getApprovalEntity(
  address grantor,
  address grantee,
  uint256 systemId
) pure returns (uint256) {
  return uint256(keccak256(abi.encode(grantor, grantee, systemId)));
}

uint256 constant ID = uint256(keccak256("world.system.approval"));

contract ApprovalSystem is System, IApprovalSystem {
  error ApprovalSystem__OnlyWorld();
  error ApprovalSystem__TimeExpired();
  error ApprovalSystem__NumCallsExpired();
  error ApprovalSystem__ArgsMismatch();

  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public view returns (bytes memory) {
    // TODO remove execute
  }

  /**
   * @dev Approve `grantee` to call ONLY `systemId` on behalf of `msg.sender`.
   * (`systemId` == 0 is a special case, see the other `setApproval` for details)
   *
   * Approval is valid only while `block.timestamp` > `expiryTimestamp` and `numCalls` > 0.
   * If `args` isn't empty, then approval is only valid for system calls with exact `args`.
   */
  function setApproval(
    address grantee,
    uint256 systemId,
    Approval memory approval
  ) public override {
    address grantor = msg.sender;
    uint256 approvalEntity = getApprovalEntity(grantor, grantee, systemId);

    _approvalComponent().set(approvalEntity, approval);

    _approvalEntityReversalComponent().set(
      approvalEntity,
      ApprovalEntityReversal({ grantor: grantor, grantee: grantee, systemId: systemId })
    );
  }

  /**
   * @dev Approve `grantee` to call ANY system on behalf of `msg.sender`.
   * Only `expiryTimestamp` is used.
   */
  function setApproval(address grantee, Approval memory approval) public override {
    // RegisterSystem disallows id 0, so it's safe to use for generic approval
    setApproval(grantee, 0, approval);
  }

  /**
   * @dev Check approval, reduce `numCalls` for non-generic approval.
   * Revert if not approved.
   * Should be used by systems as a permission check.
   */
  function reduceApproval(
    address grantor,
    address grantee,
    bytes memory args
  ) public override {
    // Generic approval
    // (approval for all systems, denoted by systemId 0)
    Approval memory approval = getApproval(grantor, grantee);

    // Return successfully if a generic approval is valid
    // (generic approval ignores `numCalls` and `args`)
    if (approval.expiryTimestamp > block.timestamp) return;

    // Specific approval
    // (the caller is the approved system, to ensure only it can reduce `numCalls`)
    uint256 systemId = getIdByAddress(world.systems(), msg.sender);
    approval = getApproval(grantor, grantee, systemId);

    // Revert if approval is absent or expired
    // (for absent values getApproval returns 0s instead of reverting)
    if (approval.expiryTimestamp <= block.timestamp) {
      revert ApprovalSystem__TimeExpired();
    }

    // Revert if numCalls is 0
    if (approval.numCalls == 0) {
      revert ApprovalSystem__NumCallsExpired();
    }

    // Revert if approval is for specific `args` and they don't match
    if (approval.args.length > 0 && keccak256(approval.args) != keccak256(args)) {
      revert ApprovalSystem__ArgsMismatch();
    }

    // Reduce numCalls; except `type(uint128).max` is permanent approval
    if (approval.numCalls != type(uint128).max) {
      approval.numCalls -= 1;
      uint256 approvalEntity = getApprovalEntity(grantor, grantee, systemId);
      _approvalComponent().set(approvalEntity, approval);
    }
  }

  /**
   * @dev Revoke `grantee`'s approval to call `systemId` on behalf of `msg.sender`.
   */
  function revokeApproval(address grantee, uint256 systemId) public override {
    _approvalComponent().remove(getApprovalEntity(msg.sender, grantee, systemId));
  }

  /**
   * @dev Revoke `grantee`'s approval to call any system on behalf of `msg.sender`.
   */
  function revokeApproval(address grantee) public override {
    // RegisterSystem disallows id 0, so it's safe to use for generic approval
    _approvalComponent().remove(getApprovalEntity(msg.sender, grantee, 0));
  }

  function getApproval(
    address grantor,
    address grantee,
    uint256 systemId
  ) public view override returns (Approval memory) {
    return _approvalComponent().getValue(getApprovalEntity(grantor, grantee, systemId));
  }

  function getApproval(address grantor, address grantee) public view override returns (Approval memory) {
    // RegisterSystem disallows id 0, so it's safe to use for generic approval
    return getApproval(grantor, grantee, 0);
  }

  function _approvalComponent() internal view returns (ApprovalComponent) {
    return ApprovalComponent(getAddressById(components, approvalComponentId));
  }

  function _approvalEntityReversalComponent() internal view returns (ApprovalEntityReversalComponent) {
    return ApprovalEntityReversalComponent(getAddressById(components, approvalEntityReversalComponentId));
  }
}
