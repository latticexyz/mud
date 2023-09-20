// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

interface IWorldErrors {
  error WorldAlreadyInitialized();
  error ResourceExists(ResourceId resourceId, string resourceIdString);
  error ResourceNotFound(ResourceId resourceId, string resourceIdString);
  error AccessDenied(string resource, address caller);
  error InvalidResourceId(ResourceId resourceId, string resourceIdString);
  error SystemExists(address system);
  error FunctionSelectorExists(bytes4 functionSelector);
  error FunctionSelectorNotFound(bytes4 functionSelector);
  error DelegationNotFound(address delegator, address delegatee);
  error InsufficientBalance(uint256 balance, uint256 amount);
  error InterfaceNotSupported(address contractAddress, bytes4 interfaceId);
}
