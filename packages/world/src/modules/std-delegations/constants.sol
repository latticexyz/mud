// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ResourceSelector } from "../../ResourceSelector.sol";
import { ROOT_NAMESPACE } from "../../constants.sol";

bytes16 constant MODULE_NAME = bytes16("stddelegations.m");

// Callbound delegation
bytes32 constant CALLBOUND_DELEGATION = bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("callbound.d")));

// Timebound delegation
bytes32 constant TIMEBOUND_DELEGATION = bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("timebound.d")));
