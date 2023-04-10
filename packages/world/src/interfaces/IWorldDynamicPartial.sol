// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Schema } from "@latticexyz/store/src/Schema.sol";

import { IErrors } from "./IErrors.sol";
import { ISystemHook } from "./ISystemHook.sol";
import { IModule } from "./IModule.sol";

/**
 * World methods to access partial dynamic data.
 */
interface IWorldDynamicPartial is IErrors {
  /**
   * Push data to the end of a field in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function pushToField(
    bytes16 namespace,
    bytes16 file,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) external;

  /**
   * Update data at `startByteIndex` of a field in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function updateInField(
    bytes16 namespace,
    bytes16 file,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) external;
}
