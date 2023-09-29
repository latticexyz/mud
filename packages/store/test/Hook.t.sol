// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Hook, HookLib } from "../src/Hook.sol";

contract HookTest is Test, GasReporter {
  uint8 public constant NONE = 0; // 0b00000000
  uint8 public constant FIRST = 1 << 0; // 0b00000001
  uint8 public constant SECOND = 1 << 1; // 0b00000010
  uint8 public constant THIRD = 1 << 2; // 0b00000100
  uint8 public constant FOURTH = 1 << 3; // 0b00001000
  uint8 public constant FIFTH = 1 << 4; // 0b00010000
  uint8 public constant SIXTH = 1 << 5; // 0b00100000
  uint8 public constant SEVENTH = 1 << 6; // 0b01000000
  uint8 public constant EIGHTH = 1 << 7; // 0b10000000

  function testFuzzEncode(address hookAddress, uint8 encodedHooks) public {
    assertEq(
      Hook.unwrap(HookLib.encode(hookAddress, encodedHooks)),
      bytes21(abi.encodePacked(hookAddress, encodedHooks))
    );
  }

  function testIsEnabled() public {
    Hook hook = HookLib.encode(address(0), THIRD | FIFTH);

    startGasReport("check if hook is enabled");
    hook.isEnabled(EIGHTH);
    endGasReport();

    assertFalse(hook.isEnabled(FIRST), "FIRST");
    assertFalse(hook.isEnabled(SECOND), "SECOND");
    assertTrue(hook.isEnabled(THIRD), "THIRD");
    assertFalse(hook.isEnabled(FOURTH), "FOURTH");
    assertTrue(hook.isEnabled(FIFTH), "FIFTH");
    assertFalse(hook.isEnabled(SIXTH), "SIXTH");
    assertFalse(hook.isEnabled(SEVENTH), "SEVENTH");
    assertFalse(hook.isEnabled(EIGHTH), "EIGHTH");
  }

  function testFuzzIsEnabled(
    address hookAddress,
    bool first,
    bool second,
    bool third,
    bool fourth,
    bool fifth,
    bool sixth,
    bool seventh,
    bool eighth
  ) public {
    uint8 encodedHooks = 0;
    if (first) encodedHooks |= FIRST;
    if (second) encodedHooks |= SECOND;
    if (third) encodedHooks |= THIRD;
    if (fourth) encodedHooks |= FOURTH;
    if (fifth) encodedHooks |= FIFTH;
    if (sixth) encodedHooks |= SIXTH;
    if (seventh) encodedHooks |= SEVENTH;
    if (eighth) encodedHooks |= EIGHTH;

    Hook hook = HookLib.encode(hookAddress, encodedHooks);

    assertEq(hook.isEnabled(FIRST), first, "FIRST");
    assertEq(hook.isEnabled(SECOND), second, "SECOND");
    assertEq(hook.isEnabled(THIRD), third, "THIRD");
    assertEq(hook.isEnabled(FOURTH), fourth, "FOURTH");
    assertEq(hook.isEnabled(FIFTH), fifth, "FIFTH");
    assertEq(hook.isEnabled(SIXTH), sixth, "SIXTH");
    assertEq(hook.isEnabled(SEVENTH), seventh, "SEVENTH");
    assertEq(hook.isEnabled(EIGHTH), eighth, "EIGHTH");
  }

  function testFuzzGetAddressAndBitmap(address hookAddress, uint8 encodedHooks) public {
    Hook hook = HookLib.encode(hookAddress, encodedHooks);

    assertEq(hook.getAddress(), hookAddress);
    assertEq(hook.getBitmap(), encodedHooks);
  }
}
