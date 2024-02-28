// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "./ResourceId.sol";

// Errors include a human-readable resource/table ID string for better logging and debugging
error Store_TableAlreadyExists(ResourceId tableId, string tableIdString);
error Store_TableNotFound(ResourceId tableId, string tableIdString);
error Store_InvalidResourceType(bytes2 expected, ResourceId resourceId, string resourceIdString);

error Store_InvalidStaticDataLength(uint256 expected, uint256 received);
error Store_InvalidBounds(uint256 start, uint256 end);
error Store_IndexOutOfBounds(uint256 length, uint256 accessedIndex);
error Store_InvalidKeyNamesLength(uint256 expected, uint256 received);
error Store_InvalidFieldNamesLength(uint256 expected, uint256 received);
error Store_InvalidValueSchemaLength(uint256 expected, uint256 received);
error Store_InvalidValueSchemaStaticLength(uint256 expected, uint256 received);
error Store_InvalidValueSchemaDynamicLength(uint256 expected, uint256 received);
error Store_InvalidSplice(uint40 startWithinField, uint40 deleteCount, uint40 fieldLength);

/// @notice Error emitted when a function is not implemented.
error StoreHook_NotImplemented();
