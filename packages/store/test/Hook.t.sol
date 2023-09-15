// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Hook, HookLib } from "../src/Hook.sol";

contract HookTest is Test, GasReporter {
  uint8 public NONE = 0x00; // 0b00000000
  uint8 public FIRST = 0x01; // 0b00000001
  uint8 public SECOND = 0x02; // 0b00000010
  uint8 public THIRD = 0x04; // 0b00000100
  uint8 public FOURTH = 0x08; // 0b00001000
  uint8 public FIFTH = 0x10; // 0b00010000
  uint8 public SIXTH = 0x20; // 0b00100000
  uint8 public SEVENTH = 0x40; // 0b01000000
  uint8 public EIGHTH = 0x80; // 0b10000000

  function testFuzzEncode(address hookAddress, uint8 encodedHooks) public {
    assertEq(
      Hook.unwrap(HookLib.encode(hookAddress, encodedHooks)),
      bytes21(abi.encodePacked(hookAddress, encodedHooks))
    );
  }

  function testIsEnabled() public {
    Hook hook = HookLib.encode(address(0), THIRD);

    startGasReport("check if hook is enabled");
    hook.isEnabled(0);
    endGasReport();

    assertFalse(hook.isEnabled(0));
    assertFalse(hook.isEnabled(1));
    assertTrue(hook.isEnabled(2));
    assertFalse(hook.isEnabled(3));
    assertFalse(hook.isEnabled(4));
    assertFalse(hook.isEnabled(5));
    assertFalse(hook.isEnabled(6));
    assertFalse(hook.isEnabled(7));
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
    uint8 encodedHooks = 0x00;
    if (first) encodedHooks |= FIRST;
    if (second) encodedHooks |= SECOND;
    if (third) encodedHooks |= THIRD;
    if (fourth) encodedHooks |= FOURTH;
    if (fifth) encodedHooks |= FIFTH;
    if (sixth) encodedHooks |= SIXTH;
    if (seventh) encodedHooks |= SEVENTH;
    if (eighth) encodedHooks |= EIGHTH;

    Hook hook = HookLib.encode(hookAddress, encodedHooks);

    assertEq(hook.isEnabled(0), first);
    assertEq(hook.isEnabled(1), second);
    assertEq(hook.isEnabled(2), third);
    assertEq(hook.isEnabled(3), fourth);
    assertEq(hook.isEnabled(4), fifth);
    assertEq(hook.isEnabled(5), sixth);
    assertEq(hook.isEnabled(6), seventh);
    assertEq(hook.isEnabled(7), eighth);
  }

  function testFuzzGetAddressAndBitmap(address hookAddress, uint8 encodedHooks) public {
    Hook hook = HookLib.encode(hookAddress, encodedHooks);

    assertEq(hook.getAddress(), hookAddress);
    assertEq(hook.getBitmap(), encodedHooks);
  }
}
