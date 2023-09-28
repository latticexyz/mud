// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "./ResourceId.sol";

interface IStoreErrors {
  // Errors include a stringified version of the tableId for easier debugging if cleartext tableIds are used
  error Store_TableAlreadyExists(ResourceId tableId, string tableIdString);
  error Store_TableNotFound(ResourceId tableId, string tableIdString);
  error Store_InvalidResourceType(bytes2 expected, ResourceId resourceId, string resourceIdString);

  error Store_InvalidDynamicDataLength(uint256 expected, uint256 received);
  error Store_IndexOutOfBounds(uint256 length, uint256 accessedIndex);
  error Store_InvalidKeyNamesLength(uint256 expected, uint256 received);
  error Store_InvalidFieldNamesLength(uint256 expected, uint256 received);
  error Store_InvalidValueSchemaLength(uint256 expected, uint256 received);
  error Store_InvalidSplice(uint40 startWithinField, uint40 deleteCount, uint40 fieldLength);
}
