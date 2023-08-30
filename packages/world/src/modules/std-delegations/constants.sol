// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ResourceSelector } from "../../ResourceSelector.sol";
import { ROOT_NAMESPACE } from "../../constants.sol";

bytes16 constant MODULE_NAME = bytes16("stddelegations.m");

// Disposable delegation
bytes32 constant DISPOSABLE_DELEGATION = bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("disposable.d")));

// Timebound delegation
bytes32 constant TIMEBOUND_DELEGATION = bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("timebound.d")));
