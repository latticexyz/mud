// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @dev Function signatures for access management system
 */
function getFunctionSignaturesAccessManagement() pure returns (string[4] memory) {
  return [
    // --- AccessManagementSystem ---
    "grantAccess(bytes32,address)",
    "revokeAccess(bytes32,address)",
    "transferOwnership(bytes32,address)",
    "renounceOwnership(bytes32)"
  ];
}

/**
 * @dev Function signatures for balance transfer system
 */
function getFunctionSignaturesBalanceTransfer() pure returns (string[2] memory) {
  return [
    // --- BalanceTransferSystem ---
    "transferBalanceToNamespace(bytes32,bytes32,uint256)",
    "transferBalanceToAddress(bytes32,address,uint256)"
  ];
}

/**
 * @dev Function signatures for batch call system
 */
function getFunctionSignaturesBatchCall() pure returns (string[2] memory) {
  return [
    // --- BatchCallSystem ---
    "batchCall((bytes32,bytes)[])",
    "batchCallFrom((address,bytes32,bytes)[])"
  ];
}

/**
 * @dev Function signatures for registration system
 */
function getFunctionSignaturesRegistration() pure returns (string[14] memory) {
  return [
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
    "registerRootFunctionSelector(bytes32,string,string)",
    "registerDelegation(address,bytes32,bytes)",
    "unregisterDelegation(address)",
    "registerNamespaceDelegation(bytes32,bytes32,bytes)",
    "unregisterNamespaceDelegation(bytes32)"
  ];
}

/**
 * @dev Function signatures for delegation system
 */
function getFunctionSignaturesDelegation() pure returns (string[1] memory) {
  return [
    // --- CallWithSignatureSystem ---
    "callWithSignature(address,bytes32,bytes,uint256)"
  ];
}
