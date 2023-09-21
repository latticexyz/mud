// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

uint8 constant BEFORE_CALL_SYSTEM = 1 << 0;
uint8 constant AFTER_CALL_SYSTEM = 1 << 1;

uint8 constant ALL = BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM;
