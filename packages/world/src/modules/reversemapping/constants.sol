// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Limiting the module namespace to 12 bytes so the last 4 bytes
// can be used for an identifier of the source table namespace to avoid
// collisions between tables with the same name in different namespaces
bytes8 constant MODULE_NAMESPACE = "revmap";
