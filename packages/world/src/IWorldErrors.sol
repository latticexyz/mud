// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

interface IWorldErrors {
  error World_AlreadyInitialized();
  error World_ResourceAlreadyExists(ResourceId resourceId, string resourceIdString);
  error World_ResourceNotFound(ResourceId resourceId, string resourceIdString);
  error World_AccessDenied(string resource, address caller);
  error World_InvalidResourceId(ResourceId resourceId, string resourceIdString);
  error World_SystemAlreadyExists(address system);
  error World_FunctionSelectorAlreadyExists(bytes4 functionSelector);
  error World_FunctionSelectorNotFound(bytes4 functionSelector);
  error World_DelegationNotFound(address delegator, address delegatee);
  error World_UnlimitedDelegationNotAllowed();
  error World_InsufficientBalance(uint256 balance, uint256 amount);
  error World_InterfaceNotSupported(address contractAddress, bytes4 interfaceId);
  error World_InvalidResourceType(bytes2 expected, ResourceId resourceId, string resourceIdString);
  error World_CallbackNotAllowed(bytes4 functionSelector);
}
