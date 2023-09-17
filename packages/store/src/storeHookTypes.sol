// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

uint8 constant BEFORE_SET_RECORD = 1 << 0;
uint8 constant AFTER_SET_RECORD = 1 << 1;
uint8 constant BEFORE_SPLICE_STATIC_DATA = 1 << 2;
uint8 constant AFTER_SPLICE_STATIC_DATA = 1 << 3;
uint8 constant BEFORE_SPLICE_DYNAMIC_DATA = 1 << 4;
uint8 constant AFTER_SPLICE_DYNAMIC_DATA = 1 << 5;
uint8 constant BEFORE_DELETE_RECORD = 1 << 6;
uint8 constant AFTER_DELETE_RECORD = 1 << 7;
