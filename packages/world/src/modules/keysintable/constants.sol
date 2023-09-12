// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Limiting the module namespace to 8 bytes so the last 8 bytes
// can be used for an identifier of the source table namespace to avoid
// collisions between tables with the same name in different namespaces
bytes8 constant MODULE_NAMESPACE = "keystab";

// TODO: once the config supports multiple namespaces, we don't have to manually construct the table id here
bytes32 constant KeysInTableTableId = bytes32(abi.encodePacked(bytes16(MODULE_NAMESPACE), bytes16("KeysInTable")));
bytes32 constant UsedKeysIndexTableId = bytes32(abi.encodePacked(bytes16(MODULE_NAMESPACE), bytes16("UsedKeysIndex")));
