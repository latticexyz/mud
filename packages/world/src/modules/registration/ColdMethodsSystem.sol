// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreRegistration, IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { IWorldAccess } from "../../interfaces/IWorldAccess.sol";
import { IModule } from "../../interfaces/IModule.sol";
import { IRegistrationSystem } from "../../interfaces/IRegistrationSystem.sol";

import { System } from "../../System.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";
import { ROOT_NAMESPACE, ROOT_NAME, REGISTRATION_SYSTEM_NAME } from "../../constants.sol";
import { AccessControl } from "../../AccessControl.sol";
import { Call } from "../../Call.sol";

import { ResourceAccess } from "../../tables/ResourceAccess.sol";
import { Systems } from "../../tables/Systems.sol";
import { InstalledModules } from "../../tables/InstalledModules.sol";

/**
 * World methods that aren't hot code paths.
 */
contract ColdMethodsSystem is System, IStoreRegistration, IWorldAccess {
  using ResourceSelector for bytes32;

  /**
   * Install the given module at the given namespace in the World.
   */
  function installModule(IModule module, bytes memory args) public {
    Call.withSender({
      msgSender: msg.sender,
      target: address(module),
      funcSelectorAndArgs: abi.encodeWithSelector(IModule.install.selector, args),
      delegate: false,
      value: 0
    });

    // Register the module in the InstalledModules table
    InstalledModules.set(module.getName(), keccak256(args), address(module));
  }

  /************************************************************************
   *
   *    WORLD ACCESS METHODS
   *
   ************************************************************************/

  /**
   * Grant access to the given namespace.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes16 namespace, address grantee) public virtual {
    grantAccess(namespace, ROOT_NAME, grantee);
  }

  /**
   * Grant access to the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes16 namespace, bytes16 name, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwnerOrSelf(namespace, name, msg.sender);

    // Grant access to the given resource
    ResourceAccess.set(resourceSelector, grantee, true);
  }

  /**
   * Retract access from the resource at the given namespace and name.
   */
  function retractAccess(bytes16 namespace, bytes16 name, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwnerOrSelf(namespace, name, msg.sender);

    // Retract access from the given resource
    ResourceAccess.deleteRecord(resourceSelector, grantee);
  }

  /************************************************************************
   *
   *    STORE OVERRIDE METHODS
   *
   ************************************************************************/

  /**
   * Register the given schema for the given table id.
   * This overload exists to conform with the IStore interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function registerSchema(bytes32 tableId, Schema valueSchema, Schema keySchema) public virtual {
    (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, REGISTRATION_SYSTEM_NAME));

    // We can't call IBaseWorld(this).registerSchema directly because it would be handled like
    // an external call, so msg.sender would be the address of the World contract
    Call.withSender({
      msgSender: msg.sender,
      target: systemAddress,
      funcSelectorAndArgs: abi.encodeWithSelector(
        IRegistrationSystem.registerTable.selector,
        tableId.getNamespace(),
        tableId.getName(),
        valueSchema,
        keySchema
      ),
      delegate: false,
      value: 0
    });
  }

  /**
   * Register metadata (tableName, fieldNames) for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function setMetadata(bytes32 tableId, string calldata tableName, string[] calldata fieldNames) public virtual {
    (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, REGISTRATION_SYSTEM_NAME));

    // We can't call IBaseWorld(this).setMetadata directly because it would be handled like
    // an external call, so msg.sender would be the address of the World contract
    Call.withSender({
      msgSender: msg.sender,
      target: systemAddress,
      funcSelectorAndArgs: abi.encodeWithSelector(
        IRegistrationSystem.setMetadata.selector,
        tableId.getNamespace(),
        tableId.getName(),
        tableName,
        fieldNames
      ),
      delegate: false,
      value: 0
    });
  }

  /**
   * Register a hook for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function registerStoreHook(bytes32 tableId, IStoreHook hook) public virtual {
    (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, REGISTRATION_SYSTEM_NAME));

    // We can't call IBaseWorld(this).registerStoreHook directly because it would be handled like
    // an external call, so msg.sender would be the address of the World contract
    Call.withSender({
      msgSender: msg.sender,
      target: systemAddress,
      funcSelectorAndArgs: abi.encodeWithSelector(
        IRegistrationSystem.registerTableHook.selector,
        tableId.getNamespace(),
        tableId.getName(),
        hook
      ),
      delegate: false,
      value: 0
    });
  }
}
