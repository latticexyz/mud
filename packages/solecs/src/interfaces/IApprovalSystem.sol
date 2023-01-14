// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ISystem } from "./ISystem.sol";

struct Approval {
  uint128 expiryTimestamp;
  uint128 numCalls;
  bytes args;
}

interface IApprovalSystem is ISystem {
  function setApproval(
    address grantee,
    uint256 systemId,
    Approval memory approval
  ) external;

  function setApproval(address grantee, Approval memory approval) external;

  function reduceApproval(
    address grantor,
    address grantee,
    bytes memory args
  ) external;

  function revokeApproval(address grantee, uint256 systemId) external;

  function revokeApproval(address grantee) external;

  function getApproval(
    address grantor,
    address grantee,
    uint256 systemId
  ) external view returns (Approval memory);

  function getApproval(address grantor, address grantee) external view returns (Approval memory);
}
