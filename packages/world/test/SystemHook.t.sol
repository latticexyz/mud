// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { Hook, HookLib } from "@latticexyz/store/src/Hook.sol";
import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM, ALL } from "../src/systemHookTypes.sol";
import { ISystemHook } from "../src/interfaces/ISystemHook.sol";

contract SystemHookTest is Test, GasReporter {
  function testFuzzEncode(address hookAddress, bool enableBeforeCallSystem, bool enableAfterCallSystem) public {
    uint8 enabledHooksBitmap = 0;
    if (enableBeforeCallSystem) enabledHooksBitmap |= BEFORE_CALL_SYSTEM;
    if (enableAfterCallSystem) enabledHooksBitmap |= AFTER_CALL_SYSTEM;

    assertEq(
      Hook.unwrap(HookLib.encode(hookAddress, enabledHooksBitmap)),
      bytes21(abi.encodePacked(hookAddress, enabledHooksBitmap))
    );
  }

  function testFuzzIsEnabled(address hookAddress, bool enableBeforeCallSystem, bool enableAfterCallSystem) public {
    uint8 enabledHooksBitmap = 0;
    if (enableBeforeCallSystem) enabledHooksBitmap |= BEFORE_CALL_SYSTEM;
    if (enableAfterCallSystem) enabledHooksBitmap |= AFTER_CALL_SYSTEM;

    Hook systemHook = HookLib.encode(hookAddress, enabledHooksBitmap);

    assertEq(systemHook.isEnabled(BEFORE_CALL_SYSTEM), enableBeforeCallSystem);
    assertEq(systemHook.isEnabled(AFTER_CALL_SYSTEM), enableAfterCallSystem);
  }

  function testFuzzGetAddressAndBitmap(
    address hookAddress,
    bool enableBeforeCallSystem,
    bool enableAfterCallSystem
  ) public {
    uint8 enabledHooksBitmap = 0;
    if (enableBeforeCallSystem) enabledHooksBitmap |= BEFORE_CALL_SYSTEM;
    if (enableAfterCallSystem) enabledHooksBitmap |= AFTER_CALL_SYSTEM;

    Hook systemHook = HookLib.encode(hookAddress, enabledHooksBitmap);

    assertEq(systemHook.getAddress(), hookAddress);
    assertEq(systemHook.getBitmap(), enabledHooksBitmap);
  }

  function testShorthand() public {
    assertEq(ALL, BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM);
  }
}
