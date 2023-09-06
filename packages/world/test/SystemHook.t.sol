// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { Hook } from "@latticexyz/store/src/Hook.sol";
import { EnabledSystemHooks, SystemHookType } from "../src/SystemHook.sol";
import { SystemHookLib } from "../src/SystemHook.sol";
import { ISystemHook } from "../src/interfaces/ISystemHook.sol";

contract SystemHookTest is Test, GasReporter {
  function testEncodeBitmap() public {
    assertEq(
      SystemHookLib.encodeBitmap(EnabledSystemHooks({ onBeforeCallSystem: false, onAfterCallSystem: false })),
      uint8(0x00),
      "0b00000000"
    );

    assertEq(
      SystemHookLib.encodeBitmap(EnabledSystemHooks({ onBeforeCallSystem: true, onAfterCallSystem: false })),
      uint8(0x01),
      "0b00000001"
    );

    assertEq(
      SystemHookLib.encodeBitmap(EnabledSystemHooks({ onBeforeCallSystem: false, onAfterCallSystem: true })),
      uint8(0x02),
      "0b00000010"
    );

    assertEq(
      SystemHookLib.encodeBitmap(EnabledSystemHooks({ onBeforeCallSystem: true, onAfterCallSystem: true })),
      uint8(0x03),
      "0b00000011"
    );
  }

  function testFuzzEncode(address hookAddress, bool enableBeforeCallSystem, bool enableAfterCallSystem) public {
    EnabledSystemHooks memory enabledHooks = EnabledSystemHooks({
      onBeforeCallSystem: enableBeforeCallSystem,
      onAfterCallSystem: enableAfterCallSystem
    });

    assertEq(
      Hook.unwrap(SystemHookLib.encode(ISystemHook(hookAddress), enabledHooks)),
      bytes21(abi.encodePacked(hookAddress, uint8(SystemHookLib.encodeBitmap(enabledHooks))))
    );
  }

  function testFuzzIsEnabled(address hookAddress, bool enableBeforeCallSystem, bool enableAfterCallSystem) public {
    EnabledSystemHooks memory enabledHooks = EnabledSystemHooks({
      onBeforeCallSystem: enableBeforeCallSystem,
      onAfterCallSystem: enableAfterCallSystem
    });

    Hook systemHook = SystemHookLib.encode(ISystemHook(hookAddress), enabledHooks);

    assertEq(systemHook.isEnabled(uint8(SystemHookType.BEFORE_CALL_SYSTEM)), enableBeforeCallSystem);
    assertEq(systemHook.isEnabled(uint8(SystemHookType.AFTER_CALL_SYSTEM)), enableAfterCallSystem);
  }

  function testFuzzGetAddressAndBitmap(
    address hookAddress,
    bool enableBeforeCallSystem,
    bool enableAfterCallSystem
  ) public {
    uint8 encodedBitmap = SystemHookLib.encodeBitmap(
      EnabledSystemHooks({ onBeforeCallSystem: enableBeforeCallSystem, onAfterCallSystem: enableAfterCallSystem })
    );

    Hook systemHook = SystemHookLib.encode(
      ISystemHook(hookAddress),
      EnabledSystemHooks({ onBeforeCallSystem: enableBeforeCallSystem, onAfterCallSystem: enableAfterCallSystem })
    );

    assertEq(systemHook.getAddress(), hookAddress);
    assertEq(systemHook.getBitmap(), encodedBitmap);
  }
}
