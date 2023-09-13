// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IWorldErrors {
  error ResourceExists(string resource);
  error ResourceNotFound(string resource);
  error AccessDenied(string resource, address caller);
  error InvalidSelector(string resource);
  error SystemExists(address system);
  error FunctionSelectorExists(bytes4 functionSelector);
  error FunctionSelectorNotFound(bytes4 functionSelector);
  error ModuleAlreadyInstalled(string module);
  error DelegationNotFound(address delegator, address delegatee);
  error InsufficientBalance(uint256 balance, uint256 amount);
  error InterfaceNotSupported(address contractAddress, bytes4 interfaceId);
}
