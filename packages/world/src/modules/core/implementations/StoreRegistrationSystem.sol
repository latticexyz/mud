// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreRegistration, IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "../../../System.sol";
import { ROOT_NAMESPACE, ROOT_NAME } from "../../../constants.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { Call } from "../../../Call.sol";

import { Systems } from "../tables/Systems.sol";
import { CORE_SYSTEM_NAME } from "../constants.sol";

import { WorldRegistrationSystem } from "./WorldRegistrationSystem.sol";

/**
 * World framework implementation of IStoreRegistration.
 *
 * See {IStoreRegistration}
 */
contract StoreRegistrationSystem is IStoreRegistration, System {
  using ResourceSelector for bytes32;

  /**
   * Register the given key schema, value schema, key names and value names for the given table id.
   * This overload exists to conform with the IStore interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function registerTable(
    bytes32 tableId,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public virtual {
    (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, CORE_SYSTEM_NAME));

    // We can't call IBaseWorld(this).registerSchema directly because it would be handled like
    // an external call, so msg.sender would be the address of the World contract
    Call.withSender({
      msgSender: _msgSender(),
      target: systemAddress,
      funcSelectorAndArgs: abi.encodeWithSelector(
        WorldRegistrationSystem.registerTable.selector,
        tableId.getNamespace(),
        tableId.getName(),
        keySchema,
        valueSchema,
        keyNames,
        fieldNames
      ),
      delegate: true,
      value: 0
    });
  }

  /**
   * Register a hook for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function registerStoreHook(bytes32 tableId, IStoreHook hook) public virtual {
    (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, CORE_SYSTEM_NAME));

    // We can't call IBaseWorld(this).registerStoreHook directly because it would be handled like
    // an external call, so msg.sender would be the address of the World contract
    Call.withSender({
      msgSender: _msgSender(),
      target: systemAddress,
      funcSelectorAndArgs: abi.encodeWithSelector(
        WorldRegistrationSystem.registerTableHook.selector,
        tableId.getNamespace(),
        tableId.getName(),
        hook
      ),
      delegate: true,
      value: 0
    });
  }
}
