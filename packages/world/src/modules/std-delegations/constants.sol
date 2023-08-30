// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ResourceSelector } from "../../ResourceSelector.sol";
import { ROOT_NAMESPACE } from "../../constants.sol";

bytes16 constant MODULE_NAME = bytes16("delegations.m");
bytes16 constant NAMESPACE = bytes16("delegations");
bytes32 constant DISPOSABLE_DELEGATION = bytes32(abi.encodePacked(NAMESPACE, bytes16("disposable.d")));
bytes32 constant DISPOSABLE_DELEGATION_ROOT = bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("disposable.d")));
bytes32 constant DISPOSABLE_DELEGATION_TABLE = bytes32(abi.encodePacked(NAMESPACE, bytes16("disposable.t")));
bytes32 constant DISPOSABLE_DELEGATION_TABLE_ROOT = bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("disposable.t")));
