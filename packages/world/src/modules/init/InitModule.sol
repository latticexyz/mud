// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "../../System.sol";
import { WorldContextProviderLib } from "../../WorldContext.sol";
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

import { AccessManagementSystem } from "./implementations/AccessManagementSystem.sol";
import { BalanceTransferSystem } from "./implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "./implementations/BatchCallSystem.sol";
import { CallWithSignatureSystem } from "./implementations/CallWithSignatureSystem/CallWithSignatureSystem.sol";

import { RegistrationSystem } from "./RegistrationSystem.sol";
import { ACCESS_MANAGEMENT_SYSTEM_ID, BALANCE_TRANSFER_SYSTEM_ID, BATCH_CALL_SYSTEM_ID, REGISTRATION_SYSTEM_ID, CALL_WITH_SIGNATURE_SYSTEM_ID } from "./constants.sol";
import { getFunctionSignaturesAccessManagement, getFunctionSignaturesBalanceTransfer, getFunctionSignaturesBatchCall, getFunctionSignaturesRegistration, getFunctionSignaturesCallWithSignature } from "./functionSignatures.sol";

import { Systems } from "../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../codegen/tables/FunctionSelectors.sol";
import { FunctionSignatures } from "../../codegen/tables/FunctionSignatures.sol";
import { SystemHooks } from "../../codegen/tables/SystemHooks.sol";
import { SystemRegistry } from "../../codegen/tables/SystemRegistry.sol";
import { InitModuleAddress } from "../../codegen/tables/InitModuleAddress.sol";
import { Balances } from "../../codegen/tables/Balances.sol";
import { CallWithSignatureNonces } from "../../codegen/tables/CallWithSignatureNonces.sol";

import { WorldRegistrationSystem } from "./implementations/WorldRegistrationSystem.sol";

/**
 * @title Init Module
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice Registers internal World tables, systems, and their function selectors.
 * @dev This module only supports `installRoot` because it installs root tables, systems and function selectors.
 */
contract InitModule is Module {
  address internal immutable accessManagementSystem;
  address internal immutable balanceTransferSystem;
  address internal immutable batchCallSystem;
  address internal immutable registrationSystem;
  address internal immutable delegationSystem;

  constructor(
    AccessManagementSystem _accessManagementSystem,
    BalanceTransferSystem _balanceTransferSystem,
    BatchCallSystem _batchCallSystem,
    RegistrationSystem _registrationSystem,
    CallWithSignatureSystem _delegationSystem
  ) {
    accessManagementSystem = address(_accessManagementSystem);
    balanceTransferSystem = address(_balanceTransferSystem);
    batchCallSystem = address(_batchCallSystem);
    registrationSystem = address(_registrationSystem);
    delegationSystem = address(_delegationSystem);
  }

  /**
   * @notice Root installation of the module.
   * @dev Registers core tables, systems, and function selectors in the World.
   */
  function installRoot(bytes memory) public override {
    _registerTables();
    _registerSystems();
    _registerFunctionSelectors();
  }

  /**
   * @notice Register World's tables.
   * @dev This internal function registers various tables and sets initial permissions.
   */
  function _registerTables() internal {
    StoreCore.registerInternalTables();
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
    InitModuleAddress.register();
    CallWithSignatureNonces.register();

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
   * @notice Register the systems in the World.
   */
  function _registerSystems() internal {
    _registerSystem(accessManagementSystem, ACCESS_MANAGEMENT_SYSTEM_ID);
    _registerSystem(balanceTransferSystem, BALANCE_TRANSFER_SYSTEM_ID);
    _registerSystem(batchCallSystem, BATCH_CALL_SYSTEM_ID);
    _registerSystem(registrationSystem, REGISTRATION_SYSTEM_ID);
    _registerSystem(delegationSystem, CALL_WITH_SIGNATURE_SYSTEM_ID);
  }

  /**
   * @notice Register the internal system in the World.
   * @dev Uses the WorldRegistrationSystem's `registerSystem` implementation to register the system on the World.
   */
  function _registerSystem(address target, ResourceId systemId) internal {
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: registrationSystem,
      callData: abi.encodeCall(WorldRegistrationSystem.registerSystem, (systemId, System(target), true))
    });
  }

  /**
   * @notice Register function selectors for all core system functions in the World.
   * @dev Iterates through known function signatures and registers them.
   */
  function _registerFunctionSelectors() internal {
    string[4] memory functionSignaturesAccessManagement = getFunctionSignaturesAccessManagement();
    for (uint256 i = 0; i < functionSignaturesAccessManagement.length; i++) {
      _registerRootFunctionSelector(ACCESS_MANAGEMENT_SYSTEM_ID, functionSignaturesAccessManagement[i]);
    }

    string[2] memory functionSignaturesBalanceTransfer = getFunctionSignaturesBalanceTransfer();
    for (uint256 i = 0; i < functionSignaturesBalanceTransfer.length; i++) {
      _registerRootFunctionSelector(BALANCE_TRANSFER_SYSTEM_ID, functionSignaturesBalanceTransfer[i]);
    }

    string[2] memory functionSignaturesBatchCall = getFunctionSignaturesBatchCall();
    for (uint256 i = 0; i < functionSignaturesBatchCall.length; i++) {
      _registerRootFunctionSelector(BATCH_CALL_SYSTEM_ID, functionSignaturesBatchCall[i]);
    }

    string[14] memory functionSignaturesRegistration = getFunctionSignaturesRegistration();
    for (uint256 i = 0; i < functionSignaturesRegistration.length; i++) {
      _registerRootFunctionSelector(REGISTRATION_SYSTEM_ID, functionSignaturesRegistration[i]);
    }

    string[1] memory functionSignaturesCallWithSignature = getFunctionSignaturesCallWithSignature();
    for (uint256 i = 0; i < functionSignaturesCallWithSignature.length; i++) {
      _registerRootFunctionSelector(CALL_WITH_SIGNATURE_SYSTEM_ID, functionSignaturesCallWithSignature[i]);
    }
  }

  /**
   * @notice Register the function selector in the World.
   * @dev Uses the RegistrationSystem's `registerRootFunctionSelector` to register the function selector.
   */
  function _registerRootFunctionSelector(ResourceId systemId, string memory functionSignature) internal {
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: registrationSystem,
      callData: abi.encodeCall(
        WorldRegistrationSystem.registerRootFunctionSelector,
        (systemId, functionSignature, functionSignature)
      )
    });
  }
}
