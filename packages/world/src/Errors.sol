// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library Errors {
  error ResourceExists(string resource);
  error AccessDenied(string resource, address caller);
  error InvalidSelector(string resource);
  error SystemExists(address system);
  error FunctionSelectorExists(bytes4 functionSelector);
  error FunctionSelectorNotFound(bytes4 functionSelector);
}
