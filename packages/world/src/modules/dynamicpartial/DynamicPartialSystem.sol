// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreCoreDynamicPartial } from "@latticexyz/store/src/StoreCoreDynamicPartial.sol";

import { IStoreDynamicPartial } from "@latticexyz/store/src/IStoreDynamicPartial.sol";
import { IWorldDynamicPartial } from "../../interfaces/IWorldDynamicPartial.sol";

import { System } from "../../System.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";
import { AccessControl } from "../../AccessControl.sol";

/**
 * World extension to interact with parts of dynamic fields (like pushing to an array).
 */
contract DynamicPartialSystem is System, IStoreDynamicPartial, IWorldDynamicPartial {
  using ResourceSelector for bytes32;

  /************************************************************************
   *
   *    WORLD STORE METHODS
   *
   ************************************************************************/

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
  ) public virtual {
    // Require access to namespace or file
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, file, msg.sender);

    // Push to the field
    StoreCoreDynamicPartial.pushToField(resourceSelector.toTableId(), key, schemaIndex, dataToPush);
  }

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
  ) public virtual {
    // Require access to namespace or file
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, file, msg.sender);

    // Update data in the field
    StoreCoreDynamicPartial.updateInField(resourceSelector.toTableId(), key, schemaIndex, startByteIndex, dataToSet);
  }

  /************************************************************************
   *
   *    STORE OVERRIDE METHODS
   *
   ************************************************************************/

  /**
   * Push data to the end of a field in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function pushToField(
    uint256 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public override {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    pushToField(resourceSelector.getNamespace(), resourceSelector.getFile(), key, schemaIndex, dataToPush);
  }

  /**
   * Update data at `startByteIndex` of a field in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function updateInField(
    uint256 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    updateInField(
      resourceSelector.getNamespace(),
      resourceSelector.getFile(),
      key,
      schemaIndex,
      startByteIndex,
      dataToSet
    );
  }
}
