// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

bytes16 constant ROOT_NAMESPACE = 0;
bytes16 constant ROOT_NAME = 0;
bytes32 constant UNLIMITED_DELEGATION = bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("unlimited.d")));
