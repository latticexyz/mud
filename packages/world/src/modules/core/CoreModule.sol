// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreRegistration } from "@latticexyz/store/src/IStore.sol";
import { IWorldAccess } from "../../interfaces/IWorldAccess.sol";

import { RegistrationSystem } from "./RegistrationSystem.sol";
import { ColdMethodsSystem } from "./ColdMethodsSystem.sol";

import { Call } from "../../Call.sol";
import { ROOT_NAMESPACE, CORE_MODULE_NAME, REGISTRATION_SYSTEM_NAME, COLD_METHODS_SYSTEM_NAME } from "../../constants.sol";
import { WorldContext } from "../../WorldContext.sol";
import { Resource } from "../../Types.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { NamespaceOwner } from "../../tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../tables/ResourceAccess.sol";
import { Systems } from "../../tables/Systems.sol";
import { FunctionSelectors } from "../../tables/FunctionSelectors.sol";
import { InstalledModules } from "../../tables/InstalledModules.sol";

import { ResourceType } from "./tables/ResourceType.sol";
import { SystemRegistry } from "./tables/SystemRegistry.sol";

/**
 * The CoreModule registers internal World tables.

 * Note:
 * This module is required to be delegatecalled via `World.registerRootSystem`.
 * because otherwise the registration of tables would require the `registerTable`
 * function selector to already exist on the World before `RegistrationSystem` in registered
 */
contract CoreModule is IModule, WorldContext {
  // Since RegistrationSystem and ColdMethodsSystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  address immutable registrationSystem = address(new RegistrationSystem());
  ColdMethodsSystem immutable coldMethodsSystem = new ColdMethodsSystem();

  function getName() public pure returns (bytes16) {
    return CORE_MODULE_NAME;
  }

  function install(bytes memory) public override {
    _installCoreTables();
    _installRegistrationMethods();
    _installColdMethods();
  }

  function _installCoreTables() internal {
    NamespaceOwner.setMetadata();

    InstalledModules.registerSchema();
    InstalledModules.setMetadata();

    ResourceAccess.registerSchema();
    ResourceAccess.setMetadata();
    ResourceAccess.set(ROOT_NAMESPACE, _msgSender(), true);

    Systems.registerSchema();
    Systems.setMetadata();

    FunctionSelectors.registerSchema();
    FunctionSelectors.setMetadata();
  }

  function _installRegistrationMethods() internal {
    // Register tables required by RegistrationSystem
    SystemRegistry.registerSchema();
    SystemRegistry.setMetadata();
    ResourceType.registerSchema();
    ResourceType.setMetadata();

    // Set the ROOT_NAMESPACE resource type to NAMESPACE
    ResourceType.set(ROOT_NAMESPACE, Resource.NAMESPACE);

    // Delegatecall the RegistrationSystem and pass on the original _msgSender() value.
    // This is required because the `registerSystem` function selector is not registered in the World yet.
    Call.withSender({
      msgSender: _msgSender(),
      target: registrationSystem,
      delegate: true,
      value: 0,
      funcSelectorAndArgs: abi.encodeWithSelector(
        RegistrationSystem.registerSystem.selector,
        ROOT_NAMESPACE,
        REGISTRATION_SYSTEM_NAME,
        registrationSystem,
        true
      )
    });

    // Register root function selectors for the RegistrationSystem in the World
    bytes4[9] memory rootFunctionSelectors = [
      RegistrationSystem.registerNamespace.selector,
      RegistrationSystem.registerTable.selector,
      RegistrationSystem.setMetadata.selector,
      RegistrationSystem.registerHook.selector,
      RegistrationSystem.registerTableHook.selector,
      RegistrationSystem.registerSystemHook.selector,
      RegistrationSystem.registerSystem.selector,
      RegistrationSystem.registerFunctionSelector.selector,
      RegistrationSystem.registerRootFunctionSelector.selector
    ];

    // As above, delegatecall the RegistrationSystem directly because the
    // `registerRootFunctionSelector` method is not registered in the World yet.
    for (uint256 i = 0; i < rootFunctionSelectors.length; i++) {
      Call.withSender({
        msgSender: _msgSender(),
        target: registrationSystem,
        delegate: true,
        value: 0,
        funcSelectorAndArgs: abi.encodeWithSelector(
          RegistrationSystem.registerRootFunctionSelector.selector,
          ROOT_NAMESPACE,
          REGISTRATION_SYSTEM_NAME,
          rootFunctionSelectors[i], // Use the same function selector for the World as in RegistrationSystem
          rootFunctionSelectors[i]
        )
      });
    }
  }

  function _installColdMethods() internal {
    IBaseWorld world = IBaseWorld(_world());

    world.registerSystem(ROOT_NAMESPACE, COLD_METHODS_SYSTEM_NAME, coldMethodsSystem, true);

    // Register root function selectors for the ColdMethodsModule in the World
    bytes4[6] memory rootFunctionSelectors = [
      IStoreRegistration.registerSchema.selector,
      IStoreRegistration.setMetadata.selector,
      IStoreRegistration.registerStoreHook.selector,
      IWorldAccess.installModule.selector,
      IWorldAccess.grantAccess.selector,
      IWorldAccess.retractAccess.selector
    ];

    for (uint256 i = 0; i < rootFunctionSelectors.length; i++) {
      world.registerRootFunctionSelector(
        ROOT_NAMESPACE,
        COLD_METHODS_SYSTEM_NAME,
        rootFunctionSelectors[i], // Use the same function selector for the World as in ColdMethodsSystem
        rootFunctionSelectors[i]
      );
    }
  }
}
