// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

uint8 constant BEFORE_SET_RECORD = 1 << 0;
uint8 constant AFTER_SET_RECORD = 1 << 1;
// TODO: do we need to differentiate between static and dynamic set field?
uint8 constant BEFORE_SET_FIELD = 1 << 2;
uint8 constant AFTER_SET_FIELD = 1 << 3;
uint8 constant BEFORE_DELETE_RECORD = 1 << 4;
uint8 constant AFTER_DELETE_RECORD = 1 << 5;
