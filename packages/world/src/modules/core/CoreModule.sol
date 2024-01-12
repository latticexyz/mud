// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { WorldContextProviderLib, WorldContextConsumer } from "../../WorldContext.sol";
import { ROOT_NAMESPACE_ID, STORE_NAMESPACE_ID, WORLD_NAMESPACE_ID } from "../../constants.sol";
import { Module } from "../../Module.sol";

import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { NamespaceOwner } from "../../codegen/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../codegen/tables/ResourceAccess.sol";
import { InstalledModules } from "../../codegen/tables/InstalledModules.sol";
import { UserDelegationControl } from "../../codegen/tables/UserDelegationControl.sol";
import { NamespaceDelegationControl } from "../../codegen/tables/NamespaceDelegationControl.sol";

import { CoreRegistrationSystem } from "./CoreRegistrationSystem.sol";
import { CORE_MODULE_NAME, ACCESS_MANAGEMENT_SYSTEM_ID, BALANCE_TRANSFER_SYSTEM_ID, BATCH_CALL_SYSTEM_ID, CORE_REGISTRATION_SYSTEM_ID } from "./constants.sol";

import { Systems } from "../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../codegen/tables/FunctionSelectors.sol";
import { FunctionSignatures } from "../../codegen/tables/FunctionSignatures.sol";
import { SystemHooks } from "../../codegen/tables/SystemHooks.sol";
import { SystemRegistry } from "../../codegen/tables/SystemRegistry.sol";
import { Balances } from "../../codegen/tables/Balances.sol";

import { WorldRegistrationSystem } from "./implementations/WorldRegistrationSystem.sol";

/**
 * @title Core Module
 * @notice Registers internal World tables, systems, and their function selectors.
 * @dev This module only supports `installRoot` because it installs root tables, systems and function selectors.
 */

contract CoreModule is Module {
  address internal immutable accessManagementSystem;
  address internal immutable balanceTransferSystem;
  address internal immutable batchCallSystem;
  address internal immutable coreRegistrationSystem;

  constructor(
    address _accessManagementSystem,
    address _balanceTransferSystem,
    address _batchCallSystem,
    address _coreRegistrationSystem
  ) {
    accessManagementSystem = _accessManagementSystem;
    balanceTransferSystem = _balanceTransferSystem;
    batchCallSystem = _batchCallSystem;
    coreRegistrationSystem = _coreRegistrationSystem;
  }

  /**
   * @notice Get the name of the module.
   * @return Module name as bytes16.
   */
  function getName() public pure returns (bytes16) {
    return CORE_MODULE_NAME;
  }

  /**
   * @notice Root installation of the module.
   * @dev Registers core tables, systems, and function selectors in the World.
   */
  function installRoot(bytes memory) public override {
    _registerCoreTables();
    _registerCoreSystems();
    _registerFunctionSelectors();
  }

  /**
   * @notice Non-root installation of the module.
   * @dev Installation is only supported at root level, so this function will always revert.
   */
  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }

  /**
   * @notice Register core tables in the World.
   * @dev This internal function registers various tables and sets initial permissions.
   */
  function _registerCoreTables() internal {
    StoreCore.registerCoreTables();
    NamespaceOwner.register();
    Balances.register();
    InstalledModules.register();
    UserDelegationControl.register();
    NamespaceDelegationControl.register();
    ResourceAccess.register();
    Systems.register();
    FunctionSelectors.register();
    FunctionSignatures.register();
    SystemHooks.register();
    SystemRegistry.register();

    ResourceIds._setExists(ROOT_NAMESPACE_ID, true);
    NamespaceOwner._set(ROOT_NAMESPACE_ID, _msgSender());
    ResourceAccess._set(ROOT_NAMESPACE_ID, _msgSender(), true);

    ResourceIds._setExists(STORE_NAMESPACE_ID, true);
    NamespaceOwner._set(STORE_NAMESPACE_ID, _msgSender());
    ResourceAccess._set(STORE_NAMESPACE_ID, _msgSender(), true);

    ResourceIds._setExists(WORLD_NAMESPACE_ID, true);
    NamespaceOwner._set(WORLD_NAMESPACE_ID, _msgSender());
    ResourceAccess._set(WORLD_NAMESPACE_ID, _msgSender(), true);
  }

  /**
   * @notice Register the core systems in the World.
   */
  function _registerCoreSystems() internal {
    _registerSystem(accessManagementSystem, ACCESS_MANAGEMENT_SYSTEM_ID);
    _registerSystem(balanceTransferSystem, BALANCE_TRANSFER_SYSTEM_ID);
    _registerSystem(batchCallSystem, BATCH_CALL_SYSTEM_ID);
    _registerSystem(coreRegistrationSystem, CORE_REGISTRATION_SYSTEM_ID);
  }

  /**
   * @notice Register the core system in the World.
   * @dev Uses the CoreRegistrationSystem's `registerSystem` implementation to register the system on the World.
   */
  function _registerSystem(address target, ResourceId systemId) internal {
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: coreRegistrationSystem,
      callData: abi.encodeCall(WorldRegistrationSystem.registerSystem, (systemId, WorldContextConsumer(target), true))
    });
  }

  /**
   * @notice Register function selectors for all core system functions in the World.
   * @dev Iterates through known function signatures and registers them.
   */
  function _registerFunctionSelectors() internal {
    string[3] memory functionSignaturesAccessManagement = [
      // --- AccessManagementSystem ---
      "grantAccess(bytes32,address)",
      "revokeAccess(bytes32,address)",
      "transferOwnership(bytes32,address)"
    ];
    for (uint256 i = 0; i < functionSignaturesAccessManagement.length; i++) {
      _registerRootFunctionSelector(ACCESS_MANAGEMENT_SYSTEM_ID, functionSignaturesAccessManagement[i]);
    }

    string[2] memory functionSignaturesBalanceTransfer = [
      // --- BalanceTransferSystem ---
      "transferBalanceToNamespace(bytes32,bytes32,uint256)",
      "transferBalanceToAddress(bytes32,address,uint256)"
    ];
    for (uint256 i = 0; i < functionSignaturesBalanceTransfer.length; i++) {
      _registerRootFunctionSelector(BALANCE_TRANSFER_SYSTEM_ID, functionSignaturesBalanceTransfer[i]);
    }

    string[2] memory functionSignaturesBatchCall = [
      // --- BatchCallSystem ---
      "batchCall((bytes32,bytes)[])",
      "batchCallFrom((address,bytes32,bytes)[])"
    ];
    for (uint256 i = 0; i < functionSignaturesBatchCall.length; i++) {
      _registerRootFunctionSelector(BATCH_CALL_SYSTEM_ID, functionSignaturesBatchCall[i]);
    }

    string[12] memory functionSignaturesCoreRegistration = [
      // --- ModuleInstallationSystem ---
      "installModule(address,bytes)",
      // --- StoreRegistrationSystem ---
      "registerTable(bytes32,bytes32,bytes32,bytes32,string[],string[])",
      "registerStoreHook(bytes32,address,uint8)",
      "unregisterStoreHook(bytes32,address)",
      // --- WorldRegistrationSystem ---
      "registerNamespace(bytes32)",
      "registerSystemHook(bytes32,address,uint8)",
      "unregisterSystemHook(bytes32,address)",
      "registerSystem(bytes32,address,bool)",
      "registerFunctionSelector(bytes32,string)",
      "registerRootFunctionSelector(bytes32,string,bytes4)",
      "registerDelegation(address,bytes32,bytes)",
      "registerNamespaceDelegation(bytes32,bytes32,bytes)"
    ];
    for (uint256 i = 0; i < functionSignaturesCoreRegistration.length; i++) {
      _registerRootFunctionSelector(CORE_REGISTRATION_SYSTEM_ID, functionSignaturesCoreRegistration[i]);
    }
  }

  /**
   * @notice Register the function selector in the World.
   * @dev Uses the CoreRegistrationSystem's `registerRootFunctionSelector` to register the function selector.
   */
  function _registerRootFunctionSelector(ResourceId systemId, string memory functionSignature) internal {
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: coreRegistrationSystem,
      callData: abi.encodeCall(
        WorldRegistrationSystem.registerRootFunctionSelector,
        (systemId, functionSignature, bytes4(keccak256(bytes(functionSignature))))
      )
    });
  }
}
