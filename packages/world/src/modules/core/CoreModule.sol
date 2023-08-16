// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Call } from "../../Call.sol";
import { ROOT_NAMESPACE } from "../../constants.sol";
import { WorldContext } from "../../WorldContext.sol";
import { Resource } from "../../Types.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { IStoreEphemeral } from "@latticexyz/store/src/IStore.sol";
import { IWorldEphemeral } from "../../interfaces/IWorldEphemeral.sol";

import { NamespaceOwner } from "../../tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../tables/InstalledModules.sol";

import { CoreSystem } from "./CoreSystem.sol";
import { CORE_MODULE_NAME, CORE_SYSTEM_NAME } from "./constants.sol";

import { Systems } from "./tables/Systems.sol";
import { FunctionSelectors } from "./tables/FunctionSelectors.sol";
import { ResourceType } from "./tables/ResourceType.sol";
import { SystemHooks } from "./tables/SystemHooks.sol";
import { SystemRegistry } from "./tables/SystemRegistry.sol";

import { WorldRegistrationSystem } from "./implementations/WorldRegistrationSystem.sol";
import { StoreRegistrationSystem } from "./implementations/StoreRegistrationSystem.sol";
import { ModuleInstallationSystem } from "./implementations/ModuleInstallationSystem.sol";
import { AccessManagementSystem } from "./implementations/AccessManagementSystem.sol";
import { EphemeralRecordSystem } from "./implementations/EphemeralRecordSystem.sol";

/**
 * The CoreModule registers internal World tables, the CoreSystem, and its function selectors.

 * Note:
 * This module is required to be delegatecalled (via `World.registerRootSystem`),
 * because it needs to install root tables, systems and function selectors.
 */
contract CoreModule is IModule, WorldContext {
  // Since the CoreSystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  address immutable coreSystem = address(new CoreSystem());

  function getName() public pure returns (bytes16) {
    return CORE_MODULE_NAME;
  }

  function install(bytes memory) public override {
    _registerCoreTables();
    _registerCoreSystem();
    _registerFunctionSelectors();
  }

  /**
   * Register core tables in the World
   */
  function _registerCoreTables() internal {
    InstalledModules.register();
    ResourceAccess.register();
    Systems.register();
    FunctionSelectors.register();
    SystemHooks.register();
    SystemRegistry.register();
    ResourceType.register();

    ResourceAccess.set(ROOT_NAMESPACE, _msgSender(), true);
    ResourceType.set(ROOT_NAMESPACE, Resource.NAMESPACE);
  }

  /**
   * Register the CoreSystem in the World
   */
  function _registerCoreSystem() internal {
    // Use the CoreSystem's `registerSystem` implementation to register itself on the World.
    Call.withSender({
      msgSender: _msgSender(),
      target: coreSystem,
      delegate: true,
      value: 0,
      funcSelectorAndArgs: abi.encodeWithSelector(
        WorldRegistrationSystem.registerSystem.selector,
        ROOT_NAMESPACE,
        CORE_SYSTEM_NAME,
        coreSystem,
        true
      )
    });
  }

  /**
   * Register function selectors for all CoreSystem functions in the World
   */
  function _registerFunctionSelectors() internal {
    bytes4[15] memory functionSelectors = [
      // --- WorldRegistrationSystem ---
      WorldRegistrationSystem.registerNamespace.selector,
      WorldRegistrationSystem.registerTable.selector,
      WorldRegistrationSystem.registerHook.selector,
      WorldRegistrationSystem.registerTableHook.selector,
      WorldRegistrationSystem.registerSystemHook.selector,
      WorldRegistrationSystem.registerSystem.selector,
      WorldRegistrationSystem.registerFunctionSelector.selector,
      WorldRegistrationSystem.registerRootFunctionSelector.selector,
      // --- StoreRegistrationSystem ---
      StoreRegistrationSystem.registerTable.selector,
      StoreRegistrationSystem.registerStoreHook.selector,
      // --- ModuleInstallationSystem ---
      ModuleInstallationSystem.installModule.selector,
      // --- AccessManagementSystem ---
      AccessManagementSystem.grantAccess.selector,
      AccessManagementSystem.revokeAccess.selector,
      // --- EphemeralRecordSystem ---
      IStoreEphemeral.emitEphemeralRecord.selector,
      IWorldEphemeral.emitEphemeralRecord.selector
    ];

    for (uint256 i = 0; i < functionSelectors.length; i++) {
      // Use the CoreSystem's `registerRootFunctionSelector` to register the
      // root function selectors in the World.
      Call.withSender({
        msgSender: _msgSender(),
        target: coreSystem,
        delegate: true,
        value: 0,
        funcSelectorAndArgs: abi.encodeWithSelector(
          WorldRegistrationSystem.registerRootFunctionSelector.selector,
          ROOT_NAMESPACE,
          CORE_SYSTEM_NAME,
          functionSelectors[i],
          functionSelectors[i]
        )
      });
    }
  }
}
