// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// Limiting the module namespace to 7 bytes so the remaining 7 bytes
// can be used for an identifier of the source table namespace to avoid
// collisions between tables with the same name in different namespaces
bytes7 constant MODULE_NAMESPACE = "keywval";
