// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Schema } from "@latticexyz/store/src/Schema.sol";

/**
 * Necessary in addition to `IStoreEphemeral`
 * because 2 functions with the same name need 2 separate interfaces to allow referencing their selector
 */
interface IWorldEphemeral {
  /**
   * Emit the ephemeral event without modifying storage at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function emitEphemeralRecord(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    bytes calldata data,
    Schema valueSchema
  ) external;
}
